import crypto from 'node:crypto';

function getConfig() {
  const url = globalThis.process?.env?.SUPABASE_URL;
  const serviceKey = globalThis.process?.env?.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    const error = new Error('Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
    error.statusCode = 503;
    throw error;
  }
  return { url: url.replace(/\/$/, ''), serviceKey };
}

export function json(res, statusCode, payload) {
  res.status(statusCode).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(payload));
}

export function methodNotAllowed(res, methods) {
  res.setHeader('Allow', methods.join(', '));
  return json(res, 405, { error: `Método não permitido. Use: ${methods.join(', ')}.` });
}

export async function supabaseRequest(path, options = {}) {
  const { url, serviceKey } = getConfig();
  const headers = new Headers(options.headers || {});
  headers.set('apikey', serviceKey);
  headers.set('Authorization', `Bearer ${serviceKey}`);
  if (options.body != null && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${url}${path}`, { ...options, headers });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Supabase respondeu ${response.status}.`);
    error.statusCode = response.status >= 500 ? 502 : response.status;
    error.details = data;
    throw error;
  }
  return { response, data };
}

export function hashText(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function randomToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export async function uploadArtifact(path, body, contentType) {
  return supabaseRequest(`/storage/v1/object/signature-artifacts/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType, 'x-upsert': 'false' },
    body,
  });
}

export async function deleteArtifact(path) {
  try {
    await supabaseRequest('/storage/v1/object/remove', {
      method: 'POST',
      body: JSON.stringify({ bucketId: 'signature-artifacts', prefixes: [path] }),
    });
  } catch {
    // A cleanup failure must not hide the original signature result.
  }
}

export async function downloadArtifact(path) {
  const { url, serviceKey } = getConfig();
  const response = await fetch(`${url}/storage/v1/object/signature-artifacts/${path}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!response.ok) {
    const error = new Error('Arquivo assinado não encontrado.');
    error.statusCode = response.status === 404 ? 404 : 502;
    throw error;
  }
  return response;
}
