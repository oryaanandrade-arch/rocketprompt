/**
 * Script: test-auth.js
 * Purpose: Test Supabase auth signup flow
 * Usage: node --env-file=.env test-auth.js
 * 
 * Uses the public anon key (same as frontend).
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('❌ Missing environment variables. Make sure .env contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('   Run with: node --env-file=.env test-auth.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'ryanzinho.andrade+123@gmail.com',
    password: 'Password123!',
  });
  console.log("Signup Result:", error ? error.message : "Success");
}
test();
