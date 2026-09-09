export async function createSignatureLink(documentType, snapshot) {
  const response = await fetch('/api/signature-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentType, snapshot }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Não foi possível gerar o link.');
  return payload;
}

export async function getSignatureDocument(token) {
  const response = await fetch(`/api/signature-documents/${encodeURIComponent(token)}`, { cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'Não foi possível carregar o documento.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function signDocument(token, body) {
  const response = await fetch(`/api/signature-documents/${encodeURIComponent(token)}/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'Não foi possível registrar a assinatura.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export function formatExpiration(value) {
  if (!value) return 'hoje';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function toDataUrl(buffer) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(buffer);
  });
}
