// ========================================
// Create Admin User Script
// Run this in Node.js to generate password hash (SHA-256)
// ========================================

import crypto from 'crypto';

async function createAdminHash() {
  const username = 'gunupatipavankumar@gmail.com';
  const password = 'Pavang1234@';
  
  // Generate SHA-256 hash (browser-compatible)
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  
  console.log('\n========================================');
  console.log('Admin User Details:');
  console.log('========================================');
  console.log('Username:', username);
  console.log('Password:', password);
  console.log('\nPassword Hash (SHA-256):');
  console.log(passwordHash);
  console.log('\n========================================');
  console.log('SQL INSERT Statement:');
  console.log('========================================\n');
  
  console.log(`INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active)
VALUES (
  '${username}',
  '${passwordHash}',
  '${username}',
  'System Administrator',
  true
)
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    is_active = true,
    updated_at = now();\n`);
}

createAdminHash().catch(console.error);

