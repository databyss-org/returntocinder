#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const password = process.argv[2];
const envPath = path.resolve(__dirname, '..', '.env');
const key = 'ADMIN_PASSWORD_HASH';

if (!password) {
  console.error('Usage: npm run admin:hash-password -- "your-admin-password"');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const keyPattern = new RegExp(`^${key}=.*$`, 'm');
if (keyPattern.test(envContent)) {
  envContent = envContent.replace(keyPattern, `${key}=${hash}`);
} else {
  const trimmed = envContent.trimEnd();
  envContent = trimmed ? `${trimmed}\n${key}=${hash}\n` : `${key}=${hash}\n`;
}

fs.writeFileSync(envPath, envContent, 'utf8');
console.log(`Updated ${key} in .env`);
