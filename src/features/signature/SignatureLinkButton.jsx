import { useState } from 'react';
import { Check, Copy, Link2, LoaderCircle, X } from 'lucide-react';
import { createSignatureLink, formatExpiration } from './api';

const DOCUMENT_LABELS = { technical: 'Orçamento de Assistência Técnica', consulting: 'Proposta de Assessoria Especializada' };

export default function SignatureLinkButton({ documentType, snapshot, validationErrors = [] }) {
  const [state, setState] = useState({ open: false, loading: false, link: '', expiresAt: '', error: '', copied: false });

  const generate = async () => {
    setState((current) => ({ ...current, open: true, loading: true, error: '', copied: false }));
    try {
      const result = await createSignatureLink(documentType, snapshot);
      setState({ open: true, loading: false, link: result.link, expiresAt: result.expiresAt, error: '', copied: false });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error.message }));
    }
  };

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setState((current) => ({ ...current, copied: true }));
  };

  const message = state.link ? `Olá! Segue sua ${DOCUMENT_LABELS[documentType].toLowerCase()} para leitura e assinatura eletrônica:\n\n${state.link}\n\nO link é válido até ${formatExpiration(state.expiresAt)}.` : '';

  return (
    <>
      <button
        type="button"
        disabled={validationErrors.length > 0}
        title={validationErrors.length ? validationErrors.join(' ') : 'Gerar link público para assinatura'}
        onClick={generate}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        <Link2 size={16} /> Gerar link para assinatura
      </button>

      {state.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="signature-link-title">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="signature-link-title" className="text-xl font-black text-slate-950">Link de assinatura</h2><p className="mt-1 text-sm text-slate-500">A proposta foi congelada nesta versão.</p></div>
              <button type="button" onClick={() => setState((current) => ({ ...current, open: false }))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar"><X size={18} /></button>
            </div>
            {state.loading ? <div className="flex items-center gap-2 py-8 text-sm font-bold text-slate-600"><LoaderCircle className="animate-spin" size={18} /> Salvando proposta…</div> : null}
            {state.error ? <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</div> : null}
            {state.link ? (
              <div className="mt-5 grid gap-4">
                <div><label htmlFor="signature-link" className="text-xs font-black uppercase tracking-wide text-slate-600">Link público</label><input id="signature-link" readOnly value={state.link} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-800" /></div>
                <div className="flex flex-wrap gap-2"><button type="button" onClick={() => copy(state.link)} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-black text-white hover:bg-blue-800">{state.copied ? <Check size={16} /> : <Copy size={16} />}{state.copied ? 'Copiado' : 'Copiar link'}</button><button type="button" onClick={() => copy(message)} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"><Copy size={16} /> Copiar mensagem</button></div>
                <p className="text-xs leading-relaxed text-slate-500">Válido até {formatExpiration(state.expiresAt)}. Envie este link pelo WhatsApp, e-mail ou outro canal.</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
