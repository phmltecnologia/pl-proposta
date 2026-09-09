import { hashText, supabaseRequest } from './supabase.js';

export const DOCUMENT_TYPES = new Set(['technical', 'consulting']);

export function getToken(req) {
  const token = Array.isArray(req.query?.token) ? req.query.token[0] : req.query?.token;
  return typeof token === 'string' ? token.trim() : '';
}

export function tokenHash(token) {
  return hashText(token);
}

export function isExpired(document) {
  return !document?.expires_at || new Date(document.expires_at).getTime() <= Date.now();
}

export function publicDocument(document, token) {
  return {
    id: document.id,
    documentType: document.document_type,
    proposalNumber: document.proposal_number,
    clientName: document.client_name,
    snapshot: document.snapshot,
    status: isExpired(document) && document.status === 'pending' ? 'expired' : document.status,
    expiresAt: document.expires_at,
    createdAt: document.created_at,
    signedAt: document.signed_at,
    signedName: document.signed_name,
    signedDocument: document.signed_document,
    pdfUrl: document.signed_pdf_path ? `/api/signature-documents/${encodeURIComponent(token)}/pdf` : null,
  };
}

export async function findDocumentByToken(token) {
  const hash = tokenHash(token);
  const query = `?token_hash=eq.${encodeURIComponent(hash)}&select=*`;
  const { data } = await supabaseRequest(`/rest/v1/signature_documents${query}`, { method: 'GET' });
  return Array.isArray(data) ? data[0] || null : null;
}

export function endOfBrazilianDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
  return new Date(`${values.year}-${values.month}-${values.day}T23:59:59-03:00`).toISOString();
}

export function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);
  return {};
}

export function validateSnapshot(body) {
  if (!DOCUMENT_TYPES.has(body.documentType)) return 'Tipo de documento inválido.';
  if (!body.snapshot || typeof body.snapshot !== 'object' || Array.isArray(body.snapshot)) return 'Snapshot inválido.';
  const encoded = JSON.stringify(body.snapshot);
  if (encoded.length > 900_000) return 'A proposta excede o tamanho permitido.';
  return null;
}

export function validateSignature(body) {
  if (!String(body.name || '').trim()) return 'Informe seu nome completo.';
  if (!String(body.document || '').trim()) return 'Informe seu CPF ou CNPJ.';
  if (!body.accepted) return 'É necessário aceitar o conteúdo da proposta.';
  if (typeof body.signatureDataUrl !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(body.signatureDataUrl)) {
    return 'Desenhe sua assinatura antes de continuar.';
  }
  if (body.signatureDataUrl.length > 700_000) return 'A imagem da assinatura excede o tamanho permitido.';
  if (typeof body.signedPdfBase64 !== 'string' || !/^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/.test(body.signedPdfBase64)) {
    return 'Não foi possível preparar o PDF assinado.';
  }
  if (body.signedPdfBase64.length > 4_500_000) return 'O PDF assinado excede o tamanho permitido.';
  return null;
}
