import { findDocumentByToken, getToken } from '../../_lib/signature.js';
import { downloadArtifact, json, methodNotAllowed } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    const token = getToken(req);
    const document = await findDocumentByToken(token);
    if (!document?.signed_pdf_path) return json(res, 404, { error: 'PDF assinado ainda não disponível.' });
    const file = await downloadArtifact(document.signed_pdf_path);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="documento-assinado.pdf"');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.end(globalThis.Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    return json(res, error.statusCode || 500, { error: error.message || 'Não foi possível baixar o PDF assinado.' });
  }
}
