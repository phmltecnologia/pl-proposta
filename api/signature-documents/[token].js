import { findDocumentByToken, getToken, publicDocument } from '../_lib/signature.js';
import { json, methodNotAllowed } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    const token = getToken(req);
    if (!token) return json(res, 400, { error: 'Token ausente.' });
    const document = await findDocumentByToken(token);
    if (!document) return json(res, 404, { error: 'Link não encontrado.' });
    return json(res, 200, publicDocument(document, token));
  } catch (error) {
    return json(res, error.statusCode || 500, { error: error.message || 'Não foi possível carregar a proposta.' });
  }
}
