/**
 * Script: test-verify.js
 * Purpose: Test user creation and email verification via admin API
 * Usage: node --env-file=.env test-verify.js
 * 
 * Uses SERVICE_ROLE_KEY for admin-level access.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables. Make sure .env contains VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Run with: node --env-file=.env test-verify.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function test() {
  const { data: d1, error: e1 } = await supabase.auth.admin.createUser({
    email: 'test_verify_update@example.com',
    password: 'Password123!',
    email_confirm: false
  });
  console.log("Create user:", d1?.user?.id, e1);
  
  if (d1?.user?.id) {
    // Try to update the user to simulate an email verification event
    const { data: d2, error: e2 } = await supabase.auth.admin.updateUserById(d1.user.id, {
      email_confirm: true
    });
    console.log("Update user (verify email):", d2?.user?.id, e2);
  }
}
test();
