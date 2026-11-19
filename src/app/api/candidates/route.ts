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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtnrebymewbljohmfeya.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnJlYnltZXdibGpvaG1mZXlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDQyMTE5NCwiZXhwIjoyMTA5OTk3MTk0fQ.mYjkN9DAitH025GeXxLABk0CmXe0Rq0_lDkvZFifei0';

// 1. Fetch latest candidates snapshot from Supabase Cloud DB
async function fetchFromSupabase(): Promise<CandidateRecord[] | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/audit_entries?action_type=eq.CANDIDATES_CLOUD_STATE&order=created_at.desc&limit=1`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0]?.remarks) {
        const parsed = JSON.parse(data[0].remarks);
        if (Array.isArray(parsed?.candidates)) {
          return parsed.candidates;
        }
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch candidates from Supabase:', err);
  }
  return null;
}

// 2. Persist candidates snapshot to Supabase Cloud DB
async function saveToSupabase(candidates: CandidateRecord[]): Promise<void> {
  try {
    // Wrapper ensures payload satisfies check constraint (char_length(remarks) >= 5)
    const payload = JSON.stringify({ candidates });

    // 1. Insert new snapshot first (NEVER delete before inserting, preventing race-condition empty states)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/audit_entries`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        candidate_id: 'c1111111-1111-1111-1111-111111111111',
        action_type: 'CANDIDATES_CLOUD_STATE',
        remarks: payload,
        changed_by: '00000000-0000-0000-0000-000000000001',
      }),
    });

    if (res.ok) {
      const inserted = await res.json();
      const newId = Array.isArray(inserted) && inserted[0]?.id ? inserted[0].id : null;
      if (newId) {
        // 2. Safely clean up older snapshots while preserving the newly inserted state
        await fetch(`${SUPABASE_URL}/rest/v1/audit_entries?action_type=eq.CANDIDATES_CLOUD_STATE&id=neq.${newId}`, {
          method: 'DELETE',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        });
      }
    } else {
      console.warn('Supabase save returned status:', res.status);
    }
  } catch (err) {
    console.warn('Failed to save candidates to Supabase:', err);
  }
}

async function getStoredCandidates(): Promise<CandidateRecord[]> {
  // 1. Try reading from Supabase Cloud DB (Highest priority for multi-device sync)
  const cloudData = await fetchFromSupabase();
  if (cloudData !== null) {
    inMemoryCandidates = cloudData;
    try {
      await fs.writeFile(TMP_FILE, JSON.stringify(cloudData, null, 2), 'utf-8');
    } catch (e) {}
    return cloudData;
  }

  if (inMemoryCandidates !== null) {
    return inMemoryCandidates;
  }

  // 2. Try reading from /tmp/nb_candidates.json
  try {
    const tmpContent = await fs.readFile(TMP_FILE, 'utf-8');
    const parsed = JSON.parse(tmpContent);
    if (Array.isArray(parsed)) {
      inMemoryCandidates = parsed;
      return parsed;
    }
  } catch (err) {}

  // 3. Try reading from project data/candidates.json
  try {
    const content = await fs.readFile(CANDIDATES_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      inMemoryCandidates = parsed;
      return parsed;
    }
  } catch (err) {}

  inMemoryCandidates = [];
  return inMemoryCandidates;
}

async function saveStoredCandidates(candidates: CandidateRecord[]): Promise<void> {
  inMemoryCandidates = candidates;

  // 1. Save to Supabase Cloud DB (so all laptops/devices see updates immediately)
  await saveToSupabase(candidates);

  // 2. Fallback to /tmp directory
  try {
    await fs.writeFile(TMP_FILE, JSON.stringify(candidates, null, 2), 'utf-8');
  } catch (e) {}

  // 3. Try local data/ directory if writable
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), 'utf-8');
  } catch (e) {}
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

    if (Array.isArray(body)) {
      // Direct full array update
      currentCandidates = body;
    } else if (body.candidates && Array.isArray(body.candidates)) {
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
      if (Array.isArray(body.candidates)) {
        currentCandidates = body.candidates;
      }
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
