import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getInitialCandidates } from '@/lib/mockData';
import { CandidateRecord } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates.json');

async function getStoredCandidates(): Promise<CandidateRecord[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(CANDIDATES_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    // If file doesn't exist, start with clean empty list
  }

  // Clean empty candidates list
  const initial: CandidateRecord[] = [];
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CANDIDATES_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write candidates.json:', e);
  }
  return initial;
}

async function saveStoredCandidates(candidates: CandidateRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const candidates = await getStoredCandidates();
    return NextResponse.json({ success: true, candidates });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch candidates' },
      { status: 500 }
    );
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
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save candidates' },
      { status: 500 }
    );
  }
}
