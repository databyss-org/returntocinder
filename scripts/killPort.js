#!/usr/bin/env node

const { execSync } = require('child_process');

const port = process.argv[2];

if (!port) {
  console.error('Usage: node scripts/killPort.js <port>');
  process.exit(1);
}

try {
  const pids = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' })
    .split('\n')
    .map((pid) => pid.trim())
    .filter(Boolean);

  if (!pids.length) {
    process.exit(0);
  }

  execSync(`kill -9 ${pids.join(' ')}`, { stdio: 'inherit' });
  console.log(`Killed processes on port ${port}: ${pids.join(', ')}`);
} catch (error) {
  // lsof exits non-zero when nothing is listening on the port.
  process.exit(0);
}
