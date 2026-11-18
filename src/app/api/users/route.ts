import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { MOCK_USERS } from '@/lib/mockData';
import { User } from '@/types';

export const dynamic = 'force-dynamic';

// In-memory cache for serverless runtime
let inMemoryUsers: User[] | null = null;

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TMP_USERS_FILE = path.join(os.tmpdir(), 'nb_users.json');

async function getStoredUsers(): Promise<User[]> {
  if (inMemoryUsers !== null) {
    return inMemoryUsers;
  }

  // 1. Try reading from project data/users.json
  try {
    const content = await fs.readFile(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryUsers = parsed;
      return parsed;
    }
  } catch (err) {
    // Project file not found / not readable in serverless
  }

  // 2. Try reading from /tmp/nb_users.json
  try {
    const tmpContent = await fs.readFile(TMP_USERS_FILE, 'utf-8');
    const parsed = JSON.parse(tmpContent);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryUsers = parsed;
      return parsed;
    }
  } catch (err) {
    // /tmp file not initialized yet
  }

  // Default to MOCK_USERS (contains Admin, Compliance, Accounts)
  inMemoryUsers = MOCK_USERS;
  return inMemoryUsers;
}

async function saveStoredUsers(users: User[]): Promise<void> {
  inMemoryUsers = users;

  // 1. Try local data/ directory
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return;
  } catch (e) {
    // Read-only filesystem in Vercel serverless environment
  }

  // 2. Fallback to /tmp directory
  try {
    await fs.writeFile(TMP_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write users to /tmp:', e);
  }
}

export async function GET() {
  try {
    const users = await getStoredUsers();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ success: true, users: inMemoryUsers || MOCK_USERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let currentUsers = await getStoredUsers();

    if (body.users && Array.isArray(body.users)) {
      // Direct full array update
      currentUsers = body.users;
    } else if (body.action === 'CREATE' && body.user) {
      const newUser: User = {
        ...body.user,
        id: body.user.id || `user-${Date.now()}`,
      };
      currentUsers = [...currentUsers, newUser];
    } else if (body.action === 'UPDATE' && body.user) {
      currentUsers = currentUsers.map((u) => (u.id === body.user.id ? { ...u, ...body.user } : u));
    } else if (body.action === 'DELETE' && body.userId) {
      currentUsers = currentUsers.filter((u) => u.id !== body.userId);
    } else if (body.id) {
      // Single user update / upsert
      const existingIdx = currentUsers.findIndex((u) => u.id === body.id);
      if (existingIdx >= 0) {
        currentUsers[existingIdx] = { ...currentUsers[existingIdx], ...body };
      } else {
        currentUsers.push(body);
      }
    }

    await saveStoredUsers(currentUsers);
    return NextResponse.json({ success: true, users: currentUsers });
  } catch (error: any) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ success: true, users: inMemoryUsers || MOCK_USERS });
  }
}
