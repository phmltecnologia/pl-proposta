import { useEffect, useMemo, useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Download,
  FilePlus2,
  Library,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import ConsultingPdf from './ConsultingPdf';
import {
  CONSULTING_MODULES_KEY,
  CONSULTING_QUOTE_KEY,
  cloneDefaultModules,
  createDefaultQuote,
  makeId,
} from './defaults';

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'text-xs font-black uppercase tracking-wide text-slate-600';

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function Field({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className={labelClass}>{label}</span>{children}</label>;
}

function TextField({ label, value, onChange, placeholder = '', type = 'text', className = '', required = false }) {
  const missing = required && !String(value ?? '').trim();
  return (
    <Field label={label} className={className}>
      <input type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} aria-required={required} aria-invalid={missing} className={`${inputClass} ${missing ? 'border-amber-300 bg-amber-50 focus:border-amber-500 focus:ring-amber-100' : ''}`} />
    </Field>
  );
}

function TextAreaField({ label, value, onChange, placeholder = '', rows = 4, className = '', required = false }) {
  const missing = required && !String(value ?? '').trim();
  return (
    <Field label={label} className={className}>
      <textarea value={value ?? ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} required={required} aria-required={required} aria-invalid={missing} className={`${inputClass} resize-y leading-relaxed ${missing ? 'border-amber-300 bg-amber-50 focus:border-amber-500 focus:ring-amber-100' : ''}`} />
    </Field>
  );
}

function ModuleFields({ module, onChange }) {
  return (
    <div className="grid gap-4 pt-4">
      <TextField label="Nome principal" value={module.title} onChange={(value) => onChange({ title: value })} />
      <TextAreaField label="Descrição" value={module.description} onChange={(value) => onChange({ description: value })} rows={3} placeholder="Explique o módulo em poucas palavras, de forma simples." />
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="Carga horária (h)" type="number" value={module.workload} onChange={(value) => onChange({ workload: Math.max(0, Number(value) || 0) })} />
        <TextField label="Prazo" type="number" value={module.duration} onChange={(value) => onChange({ duration: Math.max(0, Number(value) || 0) })} />
        <Field label="Unidade do prazo">
          <select value={module.durationUnit || 'dias úteis'} onChange={(event) => onChange({ durationUnit: event.target.value })} className={inputClass}>
            <option>dias úteis</option>
            <option>dias corridos</option>
            <option>semanas</option>
            <option>meses</option>
          </select>
        </Field>
        <TextField label="Investimento (R$)" type="number" value={module.investment} onChange={(value) => onChange({ investment: Math.max(0, Number(value) || 0) })} />
      </div>
    </div>
  );
}

function Section({ title, subtitle, children, action, className = '' }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function cleanModule(module) {
  return {
    id: module.id || makeId('module'),
    sourceModuleId: module.sourceModuleId,
    title: module.title || 'Módulo sem título',
    description: module.description ?? module.objective ?? '',
    workload: Math.max(0, Number(module.workload) || 0),
    duration: Math.max(0, Number(module.duration) || 0),
    durationUnit: module.durationUnit || 'dias úteis',
    investment: Math.max(0, Number(module.investment) || 0),
    position: module.position,
  };
}

function reindex(modules) {
  return modules.map((module, index) => ({ ...module, position: index + 1 }));
}

function normalizeSelectedModule(module, standardModules) {
  const standard = standardModules.get(module.sourceModuleId) || standardModules.get(module.id);
  if (!standard) return cleanModule(module);
  return cleanModule({ ...standard, id: module.id, sourceModuleId: module.sourceModuleId || standard.id, position: module.position });
}

function formatMoney(value) {
  if (Number(value) <= 0) return 'A definir';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

export default function ConsultingQuote({ onBack }) {
  const [quote, setQuote] = useState(() => {
    const defaults = createDefaultQuote();
    const stored = readStorage(CONSULTING_QUOTE_KEY, defaults);
    const standardModules = new Map(cloneDefaultModules().map((module) => [module.id, module]));
    return {
      ...defaults,
      ...stored,
      client: { ...defaults.client, ...(stored.client || {}) },
      selectedModules: reindex((stored.selectedModules || []).map((module) => normalizeSelectedModule(module, standardModules))),
    };
  });
  const [library, setLibrary] = useState(() => {
    const stored = readStorage(CONSULTING_MODULES_KEY, null);
    if (!Array.isArray(stored)) return cloneDefaultModules();
    const standardModules = new Map(cloneDefaultModules().map((module) => [module.id, module]));
    return reindex(stored.map((module) => standardModules.get(module.id) || cleanModule(module)));
  });
  const [expandedLibrary, setExpandedLibrary] = useState(null);
  const [expandedSelected, setExpandedSelected] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(CONSULTING_QUOTE_KEY, JSON.stringify(quote)); } catch { /* armazenamento indisponível */ }
  }, [quote]);

  useEffect(() => {
    try { localStorage.setItem(CONSULTING_MODULES_KEY, JSON.stringify(library)); } catch { /* armazenamento indisponível */ }
  }, [library]);

  const validation = useMemo(() => {
    const errors = [];
    if (!quote.client.name.trim()) errors.push('Informe o cliente.');
    if (!quote.number.trim()) errors.push('Informe o número da proposta.');
    if (!quote.objective.trim()) errors.push('Informe o objetivo.');
    if (!quote.overallTimeline.trim()) errors.push('Informe o prazo global.');
    if (!quote.paymentTerms.trim()) errors.push('Informe a condição de pagamento.');
    if (!quote.selectedModules.length) errors.push('Selecione ao menos um módulo.');
    return errors;
  }, [quote]);

  const logoUrl = typeof window === 'undefined' ? '/materials/logo.jpg' : new URL('/materials/logo.jpg', window.location.origin).href;
  const safeClient = (quote.client.name || 'CLIENTE').replace(/[\\/:*?"<>|]/g, '').trim();
  const safeNumber = (quote.number || 'SEM NUMERO').replace(/[\\/:*?"<>|]/g, '').trim();
  const fileName = `PROPOSTA DE ASSESSORIA - PL TECNOLOGIA - ${safeClient || 'CLIENTE'} - ${safeNumber || 'SEM NUMERO'}.pdf`;

  const patchQuote = (patch) => setQuote((current) => ({ ...current, ...patch }));
  const patchClient = (patch) => setQuote((current) => ({ ...current, client: { ...current.client, ...patch } }));

  const addFromLibrary = (module) => {
    const copy = cleanModule(structuredClone(module));
    copy.id = makeId('proposal-module');
    copy.sourceModuleId = module.id;
    setQuote((current) => ({ ...current, selectedModules: reindex([...current.selectedModules, copy]) }));
    setExpandedSelected(copy.id);
  };

  const updateSelected = (id, patch) => {
    setQuote((current) => ({
      ...current,
      selectedModules: current.selectedModules.map((module) => module.id === id ? cleanModule({ ...module, ...patch }) : module),
    }));
  };

  const removeSelected = (id) => {
    setQuote((current) => ({ ...current, selectedModules: reindex(current.selectedModules.filter((module) => module.id !== id)) }));
    if (expandedSelected === id) setExpandedSelected(null);
  };

  const moveSelected = (id, direction) => {
    setQuote((current) => {
      const modules = [...current.selectedModules];
      const index = modules.findIndex((module) => module.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= modules.length) return current;
      [modules[index], modules[target]] = [modules[target], modules[index]];
      return { ...current, selectedModules: reindex(modules) };
    });
  };

  const updateLibrary = (id, patch) => {
    setLibrary((current) => current.map((module) => module.id === id ? cleanModule({ ...module, ...patch }) : module));
  };

  const createCustomModule = () => {
    const module = {
      id: makeId('library-module'),
      title: 'Novo módulo personalizado',
      description: '',
      workload: 0,
      duration: 0,
      durationUnit: 'dias úteis',
      investment: 0,
      position: library.length + 1,
    };
    setLibrary((current) => [...current, module]);
    setExpandedLibrary(module.id);
  };

  const deleteLibraryModule = (id) => {
    if (!window.confirm('Excluir este módulo da biblioteca? Módulos já inseridos na proposta não serão alterados.')) return;
    setLibrary((current) => reindex(current.filter((module) => module.id !== id)));
    if (expandedLibrary === id) setExpandedLibrary(null);
  };

  const resetLibrary = () => {
    if (!window.confirm('Restaurar os cinco módulos padrão? Os módulos personalizados e as edições da biblioteca serão substituídos.')) return;
    setLibrary(cloneDefaultModules());
    setExpandedLibrary(null);
  };

  const newQuote = () => {
    if (!window.confirm('Criar uma nova proposta? O rascunho atual da assessoria será apagado deste navegador.')) return;
    setQuote(createDefaultQuote());
    setExpandedSelected(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1720px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
              <ArrowLeft size={17} /> Início
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div>
              <h1 className="text-base font-black leading-tight sm:text-lg">Assessoria Especializada</h1>
              <p className="text-xs text-slate-500">Rascunho salvo automaticamente neste navegador</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={newQuote} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold ring-1 ring-slate-300 hover:bg-slate-50">
              <FilePlus2 size={16} /> Nova proposta
            </button>
            {validation.length ? (
              <button type="button" disabled title={validation.join(' ')} className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-slate-300 px-4 py-2 text-sm font-black text-slate-600">
                <Download size={16} /> Baixar PDF
              </button>
            ) : (
              <PDFDownloadLink document={<ConsultingPdf quote={quote} logoUrl={logoUrl} />} fileName={fileName} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-blue-800">
                {({ loading }) => <><Download size={16} />{loading ? 'Preparando…' : 'Baixar PDF'}</>}
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1720px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(520px,0.82fr)]">
        <div className="grid min-w-0 gap-6">
          <Section title="Identificação" subtitle="Dados que aparecem na capa e no cabeçalho da proposta.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Número da proposta *" value={quote.number} onChange={(number) => patchQuote({ number })} required />
              <TextField label="Data de emissão" type="date" value={quote.issueDate} onChange={(issueDate) => patchQuote({ issueDate })} />
              <TextField label="Título do documento" value={quote.title} onChange={(title) => patchQuote({ title })} className="sm:col-span-2" />
            </div>
          </Section>

          <Section title="Cliente" subtitle="Apenas o nome é obrigatório para liberar o PDF.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Razão social / nome *" value={quote.client.name} onChange={(name) => patchClient({ name })} required />
              <TextField label="CNPJ / CPF" value={quote.client.document} onChange={(document) => patchClient({ document })} />
              <TextField label="Contato" value={quote.client.contact} onChange={(contact) => patchClient({ contact })} />
              <TextField label="E-mail" type="email" value={quote.client.email} onChange={(email) => patchClient({ email })} />
              <TextField label="Telefone" value={quote.client.phone} onChange={(phone) => patchClient({ phone })} />
              <TextField label="Endereço" value={quote.client.address} onChange={(address) => patchClient({ address })} />
            </div>
          </Section>

          <Section title="Apresentação" subtitle="Explique o cenário, o resultado esperado e a proposta de valor.">
            <div className="grid gap-4">
              <TextAreaField label="Contexto" value={quote.context} onChange={(context) => patchQuote({ context })} rows={5} placeholder="Situação atual da empresa e necessidade identificada…" />
              <TextAreaField label="Objetivo *" value={quote.objective} onChange={(objective) => patchQuote({ objective })} rows={4} placeholder="Resultado principal que esta assessoria deverá alcançar…" required />
              <TextAreaField label="Resumo executivo" value={quote.executiveSummary} onChange={(executiveSummary) => patchQuote({ executiveSummary })} rows={4} placeholder="Opcional: síntese da abordagem proposta…" />
            </div>
          </Section>

          <Section
            title="Biblioteca de módulos"
            subtitle="Escolha os módulos da proposta ou crie um novo. Ao adicionar, o sistema copia o módulo para esta proposta."
            action={<div className="flex gap-2"><button type="button" onClick={resetLibrary} title="Restaurar padrões" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><RefreshCw size={17} /></button><button type="button" onClick={createCustomModule} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-black text-slate-950 hover:bg-amber-400"><Plus size={16} /> Novo módulo</button></div>}
          >
            <div className="grid gap-3">
              {library.map((module) => {
                const expanded = expandedLibrary === module.id;
                return (
                  <article key={module.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-white p-2 text-blue-700 ring-1 ring-slate-200"><Library size={17} /></div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black leading-snug">{module.title}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{module.description || 'Descrição ainda não informada.'}</p>
                      </div>
                      <button type="button" onClick={() => addFromLibrary(module)} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white hover:bg-blue-800"><Plus size={14} /> Inserir</button>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-xs font-bold text-slate-500">{Number(module.workload) > 0 ? `${module.workload} h` : 'Carga a definir'} · {Number(module.duration) > 0 ? `${module.duration} ${module.durationUnit}` : 'Prazo a definir'} · {formatMoney(module.investment)}</span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => deleteLibraryModule(module.id)} className="rounded p-2 text-red-600 hover:bg-red-50" title="Excluir da biblioteca"><Trash2 size={15} /></button>
                        <button type="button" onClick={() => setExpandedLibrary(expanded ? null : module.id)} className="inline-flex items-center gap-1 rounded px-2 py-2 text-xs font-black text-slate-700 hover:bg-white"><Pencil size={14} /> Editar {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                      </div>
                    </div>
                    {expanded ? <ModuleFields module={module} onChange={(patch) => updateLibrary(module.id, patch)} /> : null}
                  </article>
                );
              })}
            </div>
          </Section>

          <Section title="Módulos selecionados" subtitle="A ordem abaixo será usada no PDF. Edite livremente sem alterar a biblioteca." className={!quote.selectedModules.length ? 'ring-amber-300' : ''}>
            {!quote.selectedModules.length ? (
              <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center">
                <Library className="mx-auto text-slate-400" size={30} />
                <p className="mt-3 font-black text-amber-900">Selecione ao menos um módulo *</p>
                <p className="mt-1 text-sm text-amber-800">Use o botão “Inserir” na biblioteca acima.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {quote.selectedModules.map((module, index) => {
                  const expanded = expandedSelected === module.id;
                  return (
                    <article key={module.id} className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white">{index + 1}</span>
                        <div className="min-w-0 flex-1"><h3 className="font-black leading-snug">{module.title}</h3><p className="mt-1 text-xs font-bold text-slate-500">{Number(module.workload) > 0 ? `${module.workload} h` : 'Carga a definir'} · {Number(module.duration) > 0 ? `${module.duration} ${module.durationUnit}` : 'Prazo a definir'} · {formatMoney(module.investment)}</p></div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button type="button" disabled={index === 0} onClick={() => moveSelected(module.id, -1)} title="Mover para cima" className="rounded p-2 text-slate-600 hover:bg-white disabled:opacity-25"><ArrowUp size={16} /></button>
                          <button type="button" disabled={index === quote.selectedModules.length - 1} onClick={() => moveSelected(module.id, 1)} title="Mover para baixo" className="rounded p-2 text-slate-600 hover:bg-white disabled:opacity-25"><ArrowDown size={16} /></button>
                          <button type="button" onClick={() => removeSelected(module.id)} title="Remover da proposta" className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                          <button type="button" onClick={() => setExpandedSelected(expanded ? null : module.id)} className="rounded p-2 text-blue-700 hover:bg-white" title="Editar módulo">{expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>
                        </div>
                      </div>
                      {expanded ? <ModuleFields module={module} onChange={(patch) => updateSelected(module.id, patch)} /> : null}
                    </article>
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="Condições comerciais" subtitle="Prazo global e pagamento são obrigatórios para liberar o download.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Prazo global *" value={quote.overallTimeline} onChange={(overallTimeline) => patchQuote({ overallTimeline })} placeholder="Ex.: 60 dias úteis após aprovação" required />
              <TextField label="Condição de pagamento *" value={quote.paymentTerms} onChange={(paymentTerms) => patchQuote({ paymentTerms })} placeholder="Ex.: 40% no aceite e 60% na entrega" required />
              <TextAreaField label="Premissas" value={quote.assumptions} onChange={(assumptions) => patchQuote({ assumptions })} rows={4} className="sm:col-span-2" />
              <TextAreaField label="Observações" value={quote.notes} onChange={(notes) => patchQuote({ notes })} rows={4} className="sm:col-span-2" placeholder="Opcional" />
              <TextField label="Local do aceite" value={quote.acceptanceLocation} onChange={(acceptanceLocation) => patchQuote({ acceptanceLocation })} className="sm:col-span-2" placeholder="Cidade/UF" />
            </div>
          </Section>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 text-slate-900"><span className="text-sm font-black">Pré-visualização do PDF</span><span className="text-xs text-slate-500">A4 multipágina · tema claro</span></div>
            <div className="hidden h-[800px] xl:block">
              <PDFViewer width="100%" height="100%" showToolbar={false}>
                <ConsultingPdf quote={quote} logoUrl={logoUrl} />
              </PDFViewer>
            </div>
            <div className="p-6 text-center text-sm text-slate-600 xl:hidden">A pré-visualização completa aparece em telas maiores. O download do PDF funciona normalmente neste dispositivo.</div>
          </div>
          <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">Os dados ficam somente neste navegador. Para trabalhar em outro computador, leve o PDF final ou abra uma nova proposta.</p>
        </aside>
      </main>
    </div>
  );
}
