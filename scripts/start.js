#!/usr/bin/env node

const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

require('dotenv').config();

const projectRoot = path.resolve(__dirname, '..');
const mongoDataDir = path.join(projectRoot, '.mongo-data');

function getDatabaseUrl() {
  return process.env.DATABASE_URL || '';
}

function isLocalMongoUrl(databaseUrl) {
  if (!databaseUrl) {
    return false;
  }

  try {
    const parsed = new URL(databaseUrl);

    if (!['mongodb:', 'mongodb+srv:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    return ['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch (error) {
    return false;
  }
}

function getMongoPort(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    return parsed.port ? Number(parsed.port) : 27017;
  } catch (error) {
    return 27017;
  }
}

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });

    socket.setTimeout(300);
    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

function waitForPort(port, host = '127.0.0.1', timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const poll = async () => {
      if (await isPortOpen(port, host)) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`Timed out waiting for MongoDB on ${host}:${port}`));
        return;
      }

      setTimeout(poll, 250);
    };

    poll();
  });
}

function spawnMongo(port) {
  fs.mkdirSync(mongoDataDir, { recursive: true });

  return spawn('mongod', ['--dbpath', mongoDataDir, '--port', String(port)], {
    stdio: 'inherit',
  });
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  const isLocal = isLocalMongoUrl(databaseUrl);
  const mongoPort = getMongoPort(databaseUrl);
  const launchArgs = process.argv.slice(2);
  const command = launchArgs[0];
  const commandArgs = launchArgs.slice(1);

  let mongoProcess = null;
  let childProcess = null;
  let shuttingDown = false;

  if (!command) {
    throw new Error('Usage: node scripts/start.js <command> [...args]');
  }

  const terminate = async (exitCode = 0) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    const exits = [];

    if (childProcess && childProcess.exitCode === null) {
      childProcess.kill('SIGTERM');
      exits.push(
        new Promise((resolve) => {
          childProcess.once('exit', resolve);
        }),
      );
    }

    if (mongoProcess && mongoProcess.exitCode === null) {
      mongoProcess.kill('SIGTERM');
      exits.push(
        new Promise((resolve) => {
          mongoProcess.once('exit', resolve);
        }),
      );
    }

    if (exits.length > 0) {
      await Promise.race([
        Promise.all(exits),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    }

    process.exit(exitCode);
  };

  if (isLocal) {
    const portOpen = await isPortOpen(mongoPort);

    if (!portOpen) {
      mongoProcess = spawnMongo(mongoPort);

      await Promise.race([
        waitForPort(mongoPort),
        new Promise((_, reject) => {
          mongoProcess.once('exit', (code, signal) => {
            reject(
              new Error(
                `mongod exited before becoming ready (code=${code}, signal=${signal || 'none'})`,
              ),
            );
          });
        }),
        new Promise((_, reject) => {
          mongoProcess.once('error', reject);
        }),
      ]);
    }
  }

  const childEnv = { ...process.env };
  if (process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'dev-server') {
    childEnv.NODE_ENV = childEnv.NODE_ENV || 'development';
  }

  childProcess = spawn(command, commandArgs, {
    env: childEnv,
    stdio: 'inherit',
  });

  process.on('SIGINT', () => terminate(0));
  process.on('SIGTERM', () => terminate(0));

  childProcess.once('exit', (code, signal) => {
    if (signal) {
      terminate(0);
      return;
    }

    terminate(code || 0);
  });
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});