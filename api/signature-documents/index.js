import { endOfBrazilianDay, tokenHash, validateSnapshot } from '../_lib/signature.js';
import { json, methodNotAllowed, randomToken, supabaseRequest } from '../_lib/supabase.js';

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    const body = req.body || {};
    const validationError = validateSnapshot(body);
    if (validationError) return json(res, 400, { error: validationError });

    const token = randomToken();
    const snapshot = body.snapshot;
    const proposalNumber = body.documentType === 'consulting' ? snapshot.number : snapshot.quote?.number;
    const clientName = body.documentType === 'consulting' ? snapshot.client?.name : snapshot.client?.name;
    const row = {
      token_hash: tokenHash(token),
      document_type: body.documentType,
      proposal_number: String(proposalNumber || '').trim() || null,
      client_name: String(clientName || '').trim() || 'Cliente',
      snapshot,
      status: 'pending',
      expires_at: endOfBrazilianDay(),
    };
    const { data } = await supabaseRequest('/rest/v1/signature_documents', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(row),
    });
    const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    return json(res, 201, { link: `${origin}/assinar/${encodeURIComponent(token)}`, expiresAt: data?.[0]?.expires_at || row.expires_at });
  } catch (error) {
    return json(res, error.statusCode || 500, { error: error.message || 'Não foi possível criar o link.' });
  }
}
