import { findDocumentByToken, getToken, isExpired, validateSignature } from '../../_lib/signature.js';
import { deleteArtifact, getClientIp, hashText, json, methodNotAllowed, supabaseRequest, uploadArtifact } from '../../_lib/supabase.js';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

function decodeDataUrl(dataUrl, expectedPrefix) {
  return globalThis.Buffer.from(dataUrl.slice(expectedPrefix.length), 'base64');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    const token = getToken(req);
    if (!token) return json(res, 400, { error: 'Token ausente.' });
    const body = req.body || {};
    const validationError = validateSignature(body);
    if (validationError) return json(res, 400, { error: validationError });

    const document = await findDocumentByToken(token);
    if (!document) return json(res, 404, { error: 'Link não encontrado.' });
    if (document.status !== 'pending') return json(res, 409, { error: 'Este documento já foi assinado.' });
    if (isExpired(document)) return json(res, 410, { error: 'Este link expirou.' });

    const stamp = `${document.id}-${Date.now()}`;
    const signaturePath = `${document.id}/signature-${stamp}.png`;
    const pdfPath = `${document.id}/signed-${stamp}.pdf`;
    await uploadArtifact(signaturePath, decodeDataUrl(body.signatureDataUrl, 'data:image/png;base64,'), 'image/png');
    try {
      await uploadArtifact(pdfPath, decodeDataUrl(body.signedPdfBase64, 'data:application/pdf;base64,'), 'application/pdf');
    } catch (error) {
      await deleteArtifact(signaturePath);
      throw error;
    }

    const signedAt = new Date().toISOString();
    const ip = getClientIp(req);
    const updateQuery = `?id=eq.${encodeURIComponent(document.id)}&status=eq.pending&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`;
    const { data } = await supabaseRequest(`/rest/v1/signature_documents${updateQuery}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        status: 'signed',
        signed_at: signedAt,
        signed_name: String(body.name).trim().slice(0, 200),
        signed_document: String(body.document).trim().slice(0, 40),
        signature_path: signaturePath,
        signed_pdf_path: pdfPath,
        signed_ip_hash: hashText(`${document.token_hash}:${ip}`),
        signed_user_agent: String(req.headers['user-agent'] || '').slice(0, 500),
      }),
    });
    if (!data?.length) {
      await deleteArtifact(signaturePath);
      await deleteArtifact(pdfPath);
      return json(res, 409, { error: 'Este documento acabou de ser assinado por outra pessoa.' });
    }
    return json(res, 200, {
      signedAt,
      signedName: String(body.name).trim(),
      pdfUrl: `/api/signature-documents/${encodeURIComponent(token)}/pdf`,
    });
  } catch (error) {
    return json(res, error.statusCode || 500, { error: error.message || 'Não foi possível registrar a assinatura.' });
  }
}
