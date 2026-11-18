import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { CandidateRecord } from '@/types';

export const dynamic = 'force-dynamic';

// In-memory cache for serverless runtime
let inMemoryCandidates: CandidateRecord[] | null = null;

const DATA_DIR = path.join(process.cwd(), 'data');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates.json');
const TMP_FILE = path.join(os.tmpdir(), 'nb_candidates.json');

async function getStoredCandidates(): Promise<CandidateRecord[]> {
  if (inMemoryCandidates !== null) {
    return inMemoryCandidates;
  }

  // 1. Try reading from project data/candidates.json
  try {
    const content = await fs.readFile(CANDIDATES_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      inMemoryCandidates = parsed;
      return parsed;
    }
  } catch (err) {
    // Project file not found / not readable in serverless
  }

  // 2. Try reading from /tmp/nb_candidates.json (serverless writable)
  try {
    const tmpContent = await fs.readFile(TMP_FILE, 'utf-8');
    const parsed = JSON.parse(tmpContent);
    if (Array.isArray(parsed)) {
      inMemoryCandidates = parsed;
      return parsed;
    }
  } catch (err) {
    // /tmp file not initialized yet
  }

  inMemoryCandidates = [];
  return inMemoryCandidates;
}

async function saveStoredCandidates(candidates: CandidateRecord[]): Promise<void> {
  inMemoryCandidates = candidates;

  // 1. Try local data/ directory
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), 'utf-8');
    return;
  } catch (e) {
    // Read-only filesystem in Vercel serverless environment
  }

  // 2. Fallback to /tmp directory
  try {
    await fs.writeFile(TMP_FILE, JSON.stringify(candidates, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write candidates to /tmp:', e);
  }
}

export async function GET() {
  try {
    const candidates = await getStoredCandidates();
    return NextResponse.json({ success: true, candidates });
  } catch (error: any) {
    console.error('Error in GET /api/candidates:', error);
    return NextResponse.json({ success: true, candidates: inMemoryCandidates || [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let currentCandidates = await getStoredCandidates();

    if (body.candidates && Array.isArray(body.candidates)) {
      // Direct full array update
      currentCandidates = body.candidates;
    } else if (body.action === 'UPSERT' && body.candidate) {
      const idx = currentCandidates.findIndex((c) => c.id === body.candidate.id);
      if (idx >= 0) {
        currentCandidates[idx] = body.candidate;
      } else {
        currentCandidates = [body.candidate, ...currentCandidates];
      }
    } else if (body.action === 'DELETE' && body.candidateId) {
      currentCandidates = currentCandidates.filter((c) => c.id !== body.candidateId);
    } else if (body.id) {
      // Single candidate upsert
      const idx = currentCandidates.findIndex((c) => c.id === body.id);
      if (idx >= 0) {
        currentCandidates[idx] = { ...currentCandidates[idx], ...body };
      } else {
        currentCandidates.unshift(body);
      }
    }

    await saveStoredCandidates(currentCandidates);
    return NextResponse.json({ success: true, candidates: currentCandidates });
  } catch (error: any) {
    console.error('Error in POST /api/candidates:', error);
    return NextResponse.json({ success: true, candidates: inMemoryCandidates || [] });
  }
}
