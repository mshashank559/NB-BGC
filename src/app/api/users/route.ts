import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MOCK_USERS } from '@/lib/mockData';
import { User } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function getStoredUsers(): Promise<User[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    // If file doesn't exist, seed with MOCK_USERS
  }

  // Seed default MOCK_USERS into data/users.json
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(MOCK_USERS, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to seed users.json:', e);
  }
  return MOCK_USERS;
}

async function saveStoredUsers(users: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const users = await getStoredUsers();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch users' },
      { status: 500 }
    );
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
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save users' },
      { status: 500 }
    );
  }
}
