/**
 * Script: create-ceo.js
 * Purpose: Create CEO admin user in Supabase
 * Usage: node --env-file=.env create-ceo.js
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (admin-level access).
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables. Make sure .env contains VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Run with: node --env-file=.env create-ceo.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function forceCreateAdmin() {
  const email = 'ryanzinho.andrade@gmail.com';
  
  const users = await supabase.auth.admin.listUsers();
  const existingUser = users.data.users.find(u => u.email === email);
  if (existingUser) {
    await supabase.auth.admin.deleteUser(existingUser.id);
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: 'CEOUser2026@',
    email_confirm: true,
    user_metadata: {
      full_name: 'CEO Ryan',
    }
  });

  if (error) {
    console.error("Erro ao forçar criação:", error);
  } else {
    console.log("CEO CRIADO COM SUCESSO!", data?.user?.id);
  }
}
forceCreateAdmin();
