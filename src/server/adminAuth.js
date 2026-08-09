import crypto from 'crypto';

const { ADMIN_PASSWORD_HASH, ADMIN_TOKEN_SECRET } = process.env;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function toHexSha256(value) {
  return crypto
    .createHash('sha256')
    .update(value || '')
    .digest('hex');
}

function safeCompareHex(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }
  const leftBuf = Buffer.from(left, 'hex');
  const rightBuf = Buffer.from(right, 'hex');
  return crypto.timingSafeEqual(leftBuf, rightBuf);
}

function signPayload(payload) {
  return crypto
    .createHmac('sha256', ADMIN_TOKEN_SECRET || ADMIN_PASSWORD_HASH)
    .update(payload)
    .digest('base64url');
}

function parseAuthHeader(authHeader = '') {
  if (!authHeader) {
    return '';
  }
  const [scheme, value] = authHeader.split(' ');
  if (scheme && scheme.toLowerCase() === 'bearer') {
    return value || '';
  }
  return authHeader;
}

export function isAdminAuthConfigured() {
  return !!ADMIN_PASSWORD_HASH;
}

export function getAdminTokenTtlMs() {
  return TOKEN_TTL_MS;
}

export function validateAdminPassword(password = '') {
  if (!isAdminAuthConfigured()) {
    return false;
  }
  const providedHash = toHexSha256(password);
  return safeCompareHex(providedHash, ADMIN_PASSWORD_HASH.toLowerCase());
}

export function createAdminToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url');
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token) {
  if (!token || !isAdminAuthConfigured()) {
    return false;
  }

  const rawToken = parseAuthHeader(token);
  const parts = rawToken.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [payload, signature] = parts;
  const expectedSignature = signPayload(payload);
  if (!safeCompareHex(toHexSha256(signature), toHexSha256(expectedSignature))) {
    return false;
  }

  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch (err) {
    return false;
  }

  return !!parsed.exp && Date.now() < parsed.exp;
}

export function getTokenFromRequest(req) {
  return req.get('Authorization') || req.query.adminToken || '';
}

export function requireAdminToken(req, res, next) {
  if (!isAdminAuthConfigured()) {
    return res.status(503).json({ error: 'admin auth not configured' });
  }
  if (!verifyAdminToken(getTokenFromRequest(req))) {
    return res.status(403).json({ error: 'forbidden' });
  }
  return next();
}
