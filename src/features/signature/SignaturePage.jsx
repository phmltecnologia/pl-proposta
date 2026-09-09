import { useEffect, useMemo, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { CheckCircle2, FileSignature, LoaderCircle, ShieldAlert } from 'lucide-react';
import ConsultingPdf from '../consulting/ConsultingPdf';
import TechnicalAssistancePdf from '../technical/TechnicalAssistancePdf';
import { formatExpiration, getSignatureDocument, signDocument, toDataUrl } from './api';
import SignaturePad from './SignaturePad';

function documentNode(document, signatureDataUrl = '', signedAt = '') {
  const logoUrl = typeof window === 'undefined' ? '/materials/logo.jpg' : new URL('/materials/logo.jpg', window.location.origin).href;
  if (document.documentType === 'consulting') return <ConsultingPdf quote={document.snapshot} logoUrl={logoUrl} signatureDataUrl={signatureDataUrl} signedAt={signedAt} />;
  return <TechnicalAssistancePdf data={document.snapshot} logoUrl={logoUrl} signatureDataUrl={signatureDataUrl} signedAt={signedAt} />;
}

function StatusCard({ icon, title, children }) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10"><section className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">{icon}<h1 className="mt-5 text-2xl font-black text-slate-950">{title}</h1><div className="mt-3 text-sm leading-relaxed text-slate-600">{children}</div></section></main>;
}

export default function SignaturePage({ token }) {
  const [document, setDocument] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [signer, setSigner] = useState({ name: '', document: '', accepted: false });
  const [submitState, setSubmitState] = useState({ loading: false, error: '', result: null });

  useEffect(() => {
    getSignatureDocument(token).then(setDocument).catch(setLoadError);
  }, [token]);

  const previewDocument = useMemo(() => document && documentNode(document, signatureDataUrl), [document, signatureDataUrl]);

  if (loadError) {
    const expired = loadError.status === 410;
    return <StatusCard icon={<ShieldAlert className="mx-auto text-amber-500" size={42} />} title={expired ? 'Este link expirou' : 'Link indisponível'}>{loadError.message}</StatusCard>;
  }
  if (!document) return <StatusCard icon={<LoaderCircle className="mx-auto animate-spin text-blue-700" size={42} />} title="Carregando documento…">Aguarde enquanto buscamos a proposta.</StatusCard>;
  if (document.status === 'expired') return <StatusCard icon={<ShieldAlert className="mx-auto text-amber-500" size={42} />} title="Este link expirou">Peça ao responsável pela proposta que gere um novo link de assinatura.</StatusCard>;
  if (document.status === 'signed' || submitState.result) {
    const signedAt = submitState.result?.signedAt || document.signedAt;
    const pdfUrl = submitState.result?.pdfUrl || document.pdfUrl;
    return <StatusCard icon={<CheckCircle2 className="mx-auto text-emerald-600" size={48} />} title="Documento assinado com sucesso"><p>Obrigado, {submitState.result?.signedName || document.signedName || signer.name}. O aceite foi registrado em {signedAt ? new Date(signedAt).toLocaleString('pt-BR') : 'data registrada'}.</p>{pdfUrl ? <a href={pdfUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">Baixar PDF assinado</a> : null}</StatusCard>;
  }

  const submit = async (event) => {
    event.preventDefault();
    if (!signer.name.trim() || !signer.document.trim() || !signer.accepted || !signatureDataUrl) return;
    setSubmitState({ loading: true, error: '', result: null });
    try {
      const signedAt = new Date().toISOString();
      const blob = await (await import('@react-pdf/renderer')).pdf(documentNode(document, signatureDataUrl, signedAt)).toBlob();
      const signedPdfBase64 = await toDataUrl(blob);
      const result = await signDocument(token, { ...signer, name: signer.name.trim(), document: signer.document.trim(), signatureDataUrl, signedPdfBase64 });
      setSubmitState({ loading: false, error: '', result });
    } catch (error) {
      setSubmitState({ loading: false, error: error.message, result: null });
    }
  };

  const canSubmit = signer.name.trim() && signer.document.trim() && signer.accepted && signatureDataUrl && !submitState.loading;
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6"><div className="mx-auto flex max-w-6xl items-center gap-3"><div className="flex h-11 w-16 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-slate-200"><img src="/materials/logo.jpg" alt="PL Tecnologia" className="max-h-full max-w-full object-contain" /></div><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">PL Tecnologia</p><h1 className="text-lg font-black">Documento para assinatura</h1></div></div></header>
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"><div className="border-b border-slate-200 px-5 py-4"><p className="text-sm font-black">{document.documentType === 'consulting' ? 'Proposta de Assessoria Especializada' : 'Orçamento de Assistência Técnica'}</p><p className="mt-1 text-xs text-slate-500">Leia o documento inteiro antes de assinar. Válido até {formatExpiration(document.expiresAt)}.</p></div><div className="h-[70vh] min-h-[580px] bg-slate-200"><PDFViewer width="100%" height="100%" showToolbar={false}>{previewDocument}</PDFViewer></div></section>
        <aside className="h-fit rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200"><div className="flex items-center gap-2"><FileSignature className="text-blue-700" size={21} /><h2 className="text-lg font-black">Assinar documento</h2></div><p className="mt-2 text-sm leading-relaxed text-slate-600">Preencha seus dados e desenhe sua assinatura para registrar o aceite eletrônico.</p><form onSubmit={submit} className="mt-5 grid gap-4"><label className="block"><span className="text-xs font-black uppercase tracking-wide text-slate-600">Nome completo *</span><input value={signer.name} onChange={(event) => setSigner((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" autoComplete="name" required /></label><label className="block"><span className="text-xs font-black uppercase tracking-wide text-slate-600">CPF ou CNPJ *</span><input value={signer.document} onChange={(event) => setSigner((current) => ({ ...current, document: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" inputMode="numeric" required /></label><div><span className="text-xs font-black uppercase tracking-wide text-slate-600">Sua assinatura *</span><div className="mt-1"><SignaturePad onChange={setSignatureDataUrl} /></div></div><label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"><input type="checkbox" checked={signer.accepted} onChange={(event) => setSigner((current) => ({ ...current, accepted: event.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700" required /><span>Declaro que li o documento, conferi os dados acima e aceito eletronicamente seu conteúdo.</span></label>{submitState.error ? <div className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{submitState.error}</div> : null}<button type="submit" disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">{submitState.loading ? <><LoaderCircle className="animate-spin" size={17} /> Registrando…</> : <><FileSignature size={17} /> Assinar documento</>}</button><p className="text-center text-[11px] leading-relaxed text-slate-500">Esta é uma assinatura eletrônica simples. O sistema registrará o aceite, a data e as informações técnicas da assinatura.</p></form></aside>
      </main>
    </div>
  );
}
