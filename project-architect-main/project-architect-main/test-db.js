/**
 * Script: test-db.js
 * Purpose: Test Supabase database connectivity and RLS
 * Usage: node --env-file=.env test-db.js
 * 
 * Uses SERVICE_ROLE_KEY to bypass RLS for admin testing.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables. Make sure .env contains VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Run with: node --env-file=.env test-db.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles check:", {data, error});
  
  const myId = "00000000-0000-0000-0000-000000000000"
  const { data: d2, error: e2 } = await supabase.from('profiles').insert([{ id: myId, user_id: myId }]);
  console.log("Insert Check", {d2, e2});
}
test();
