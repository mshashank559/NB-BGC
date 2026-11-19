import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtnrebymewbljohmfeya.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnJlYnltZXdibGpvaG1mZXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MjExOTQsImV4cCI6MjEwOTk5NzE5NH0.SyEW4L2RbXNwKyf6mgnwlhZIZe6FM7btOM-1qf2X9Vc';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnJlYnltZXdibGpvaG1mZXlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDQyMTE5NCwiZXhwIjoyMTA5OTk3MTk0fQ.mYjkN9DAitH025GeXxLABk0CmXe0Rq0_lDkvZFifei0';

// Public browser client for standard queries (with persistSession false to prevent duplicate GoTrue instance warnings)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Server/Admin client with Service Role (for elevated operations, audit logging, reminders)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

