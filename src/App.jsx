import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Plus, Trash2, Download, RefreshCw } from 'lucide-react';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const BR_NUMBER_2 = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value == null) return 0;
  const normalized = String(value).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney2(value) {
  return BR_NUMBER_2.format(toNumber(value));
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function sortLinesAsc(lines) {
  return [...(lines || [])].sort((a, b) => {
    const ad = (a?.description ?? '').trim();
    const bd = (b?.description ?? '').trim();
    const c = ad.localeCompare(bd, 'pt-BR', { sensitivity: 'base' });
    if (c !== 0) return c;
    return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
  });
}

const DEFAULT_QUOTE = {
  company: {
    name: 'PL Tecnologia',
    phone: '(48) 9 9163-6944',
    instagram: '@phml_tecnologia',
    email: '',
    city: '',
  },
  quote: {
    number: `PLT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
    issueDate: todayISO(),
    validityDays: 7,
  },
  client: {
    name: '',
    contact: '',
    phone: '',
    email: '',
  },
  service: {
    equipment: '',
    serial: '',
    complaint: '',
  },
  delivery: {
    daysAfterApproval: 2,
  },
  warranty: {
    months: 3,
  },
  pricing: {
    laborHours: 1,
    laborRate: 120,
  },
  supplies: [{ id: makeId(), description: 'Insumo (ex.: pasta térmica)', qty: 1, unitPrice: 0 }],
  services: [{ id: makeId(), description: 'Serviço (ex.: diagnóstico)', qty: 1, unitPrice: 0 }],
  notes: 'Prazo e disponibilidade sob confirmação. Garantia conforme descrição do serviço/peça.',
};

const STORAGE_KEY = 'pl-tecnologia.quote.v1';

const App = () => {
  const pageRef = useRef(null);
  const [logoOk, setLogoOk] = useState(true);
  const [unitPriceDrafts, setUnitPriceDrafts] = useState({});
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_QUOTE;
      const parsed = JSON.parse(raw);
      const merged = { ...DEFAULT_QUOTE, ...parsed };

      // Migração (versão antiga tinha `items` e campos de desconto/impostos)
      if (!merged.supplies && Array.isArray(merged.items)) {
        merged.supplies = merged.items.map((it) => ({
          id: it.id || makeId(),
          description: it.description ?? '',
          qty: toNumber(it.qty),
          unitPrice: toNumber(it.unitPrice),
        }));
      }
      if (!merged.services) merged.services = DEFAULT_QUOTE.services;
      delete merged.items;
      if (merged.delivery) {
        // migração antiga: `deadline` texto livre
        if (typeof merged.delivery.daysAfterApproval !== 'number' && merged.delivery.deadline != null) {
          const n = toNumber(merged.delivery.deadline);
          merged.delivery.daysAfterApproval = n > 0 ? Math.floor(n) : DEFAULT_QUOTE.delivery.daysAfterApproval;
        }
        delete merged.delivery.deadline;
      }
      merged.warranty = { ...DEFAULT_QUOTE.warranty, ...merged.warranty };
      merged.company = { ...DEFAULT_QUOTE.company, ...merged.company };
      const legacyPhones = ['48 991636944', '48 99163-6944'];
      if (
        !String(merged.company.phone || '').trim() ||
        legacyPhones.includes(String(merged.company.phone).trim())
      ) {
        merged.company.phone = DEFAULT_QUOTE.company.phone;
      }
      if (!String(merged.company.instagram || '').trim()) {
        merged.company.instagram = DEFAULT_QUOTE.company.instagram;
      }
      if (merged.pricing) {
        delete merged.pricing.discount;
        delete merged.pricing.taxPercent;
        delete merged.pricing.travelFee;
      }
      return merged;
    } catch {
      return DEFAULT_QUOTE;
    }
  });

  const derived = useMemo(() => {
    const laborSubtotal = toNumber(data.pricing.laborHours) * toNumber(data.pricing.laborRate);
    const suppliesSubtotal = (data.supplies || []).reduce((sum, it) => {
      const qty = toNumber(it.qty);
      const unit = toNumber(it.unitPrice);
      return sum + qty * unit;
    }, 0);
    const servicesSubtotal = (data.services || []).reduce((sum, it) => {
      const qty = toNumber(it.qty);
      const unit = toNumber(it.unitPrice);
      return sum + qty * unit;
    }, 0);
    const total = laborSubtotal + suppliesSubtotal + servicesSubtotal;

    const validityDays = Math.max(0, Math.floor(toNumber(data.quote.validityDays)));
    const expiresAt = addDaysISO(data.quote.issueDate || todayISO(), validityDays);

    return {
      laborSubtotal,
      suppliesSubtotal,
      servicesSubtotal,
      total,
      expiresAt,
    };
  }, [data]);

  const sortedSupplies = useMemo(() => sortLinesAsc(data.supplies), [data.supplies]);
  const sortedServices = useMemo(() => sortLinesAsc(data.services), [data.services]);

  const persist = (next) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const setPath = (path, value) => {
    const next = structuredClone(data);
    let cursor = next;
    for (let i = 0; i < path.length - 1; i += 1) cursor = cursor[path[i]];
    cursor[path[path.length - 1]] = value;
    persist(next);
  };

  const updateLine = (listKey, id, patch) => {
    const next = structuredClone(data);
    next[listKey] = (next[listKey] || []).map((it) => (it.id === id ? { ...it, ...patch } : it));
    persist(next);
  };

  const addLine = (listKey) => {
    const next = structuredClone(data);
    const id = makeId();
    next[listKey] = [...(next[listKey] || []), { id, description: '', qty: 1, unitPrice: 0 }];
    persist(next);
  };

  const removeLine = (listKey, id) => {
    const next = structuredClone(data);
    next[listKey] = (next[listKey] || []).filter((it) => it.id !== id);
    persist(next);
    setUnitPriceDrafts((prev) => {
      const key = `${listKey}:${id}`;
      if (!prev[key]) return prev;
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const resetAll = () => {
    persist(DEFAULT_QUOTE);
    setLogoOk(true);
  };

  const handleDownloadPDF = async () => {
    if (!pageRef.current) return;
    const element = pageRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    const imgRatio = imgWidthPx / imgHeightPx;

    let pdfWidth = pageWidth;
    let pdfHeight = pdfWidth / imgRatio;
    if (pdfHeight > pageHeight) {
      pdfHeight = pageHeight;
      pdfWidth = pdfHeight * imgRatio;
    }

    const marginX = (pageWidth - pdfWidth) / 2;
    const marginY = (pageHeight - pdfHeight) / 2;
    pdf.addImage(imgData, 'PNG', marginX, marginY, pdfWidth, pdfHeight, undefined, 'FAST');

    const safeClient = (data.client.name || 'cliente').replace(/[\\/:*?"<>|]/g, '').trim();
    const fileName = `ORCAMENTO - PL TECNOLOGIA - ${safeClient || 'CLIENTE'}.pdf`;
    pdf.save(fileName);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px] px-4 py-6 print:p-0">
        <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
          <div>
            <h1 className="text-xl font-black tracking-tight">Orçamento de Assistência Técnica</h1>
            <p className="text-sm text-slate-600">PL Tecnologia</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded bg-white px-3 py-2 text-sm font-bold shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              title="Resetar dados"
            >
              <RefreshCw size={16} />
              Reset
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-slate-800"
              title="Baixar PDF"
            >
              <Download size={16} />
              Baixar PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px,1fr] print:block">
          {/* Editor */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 print:hidden">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Nº orçamento</label>
                <input
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                  value={data.quote.number}
                  onChange={(e) => setPath(['quote', 'number'], e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Emissão</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                  value={data.quote.issueDate}
                  onChange={(e) => setPath(['quote', 'issueDate'], e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Validade (dias)</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                  value={data.quote.validityDays}
                  onChange={(e) => setPath(['quote', 'validityDays'], toNumber(e.target.value))}
                />
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Cliente</h2>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Nome</label>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={data.client.name}
                    onChange={(e) => setPath(['client', 'name'], e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Contato</label>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={data.client.contact}
                    onChange={(e) => setPath(['client', 'contact'], e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Telefone</label>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={data.client.phone}
                    onChange={(e) => setPath(['client', 'phone'], e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email</label>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={data.client.email}
                    onChange={(e) => setPath(['client', 'email'], e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Atendimento</h2>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Equipamento</label>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={data.service.equipment}
                    onChange={(e) => setPath(['service', 'equipment'], e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Nº Série</label>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={data.service.serial}
                    onChange={(e) => setPath(['service', 'serial'], e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Reclamação / Sintoma</label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={data.service.complaint}
                    onChange={(e) => setPath(['service', 'complaint'], e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Prazo de entrega</label>
                  <div className="mt-1 grid grid-cols-[5.5rem,minmax(0,1fr)] gap-2">
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                      value={toNumber(data.delivery?.daysAfterApproval)}
                      onChange={(e) =>
                        setPath(['delivery', 'daysAfterApproval'], Math.max(0, Math.floor(toNumber(e.target.value))))
                      }
                    />
                    <div className="flex min-w-0 items-center rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black leading-tight text-slate-700 sm:text-sm sm:whitespace-nowrap">
                      dias
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Garantia</label>
                  <div className="mt-1 grid grid-cols-[5.5rem,minmax(0,1fr)] gap-2">
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                      value={toNumber(data.warranty?.months)}
                      onChange={(e) =>
                        setPath(['warranty', 'months'], Math.max(0, Math.floor(toNumber(e.target.value))))
                      }
                    />
                    <div className="flex items-center rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">
                      {toNumber(data.warranty?.months) === 1 ? 'mês' : 'meses'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">INSUMOS</h2>
                <button
                  type="button"
                  onClick={() => addLine('supplies')}
                  className="inline-flex items-center gap-2 rounded bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-800"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {sortedSupplies.map((it) => {
                  const key = `supplies:${it.id}`;
                  return (
                    <div key={it.id} className="rounded-lg border border-slate-200 p-2">
                      <div className="flex items-center gap-2">
                        <input
                          className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                          placeholder="Descrição"
                          value={it.description}
                          onChange={(e) => updateLine('supplies', it.id, { description: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => removeLine('supplies', it.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                          title="Remover insumo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Qtd</label>
                          <input
                            type="number"
                            min="0"
                            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                            value={it.qty}
                            onChange={(e) => updateLine('supplies', it.id, { qty: toNumber(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Valor unit. (R$)</label>
                          <input
                            inputMode="decimal"
                            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                            value={unitPriceDrafts[key] ?? formatMoney2(it.unitPrice)}
                            onChange={(e) =>
                              setUnitPriceDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            onBlur={() => {
                              const draft = unitPriceDrafts[key];
                              if (draft == null) return;
                              updateLine('supplies', it.id, { unitPrice: toNumber(draft) });
                              setUnitPriceDrafts((prev) => {
                                const { [key]: _, ...rest } = prev;
                                return rest;
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">SERVIÇOS</h2>
                <button
                  type="button"
                  onClick={() => addLine('services')}
                  className="inline-flex items-center gap-2 rounded bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-800"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {sortedServices.map((it) => {
                  const key = `services:${it.id}`;
                  return (
                    <div key={it.id} className="rounded-lg border border-slate-200 p-2">
                      <div className="flex items-center gap-2">
                        <input
                          className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                          placeholder="Descrição"
                          value={it.description}
                          onChange={(e) => updateLine('services', it.id, { description: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => removeLine('services', it.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                          title="Remover serviço"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Qtd</label>
                          <input
                            type="number"
                            min="0"
                            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                            value={it.qty}
                            onChange={(e) => updateLine('services', it.id, { qty: toNumber(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Valor unit. (R$)</label>
                          <input
                            inputMode="decimal"
                            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                            value={unitPriceDrafts[key] ?? formatMoney2(it.unitPrice)}
                            onChange={(e) =>
                              setUnitPriceDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            onBlur={() => {
                              const draft = unitPriceDrafts[key];
                              if (draft == null) return;
                              updateLine('services', it.id, { unitPrice: toNumber(draft) });
                              setUnitPriceDrafts((prev) => {
                                const { [key]: _, ...rest } = prev;
                                return rest;
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Mão de obra</h2>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Horas</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={data.pricing.laborHours}
                    onChange={(e) => setPath(['pricing', 'laborHours'], toNumber(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Valor/hora</label>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={data.pricing.laborRate}
                    onChange={(e) => setPath(['pricing', 'laborRate'], toNumber(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Observações</h2>
              <textarea
                rows={3}
                className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold"
                value={data.notes}
                onChange={(e) => setPath(['notes'], e.target.value)}
              />
            </div>
          </div>

          {/* Preview A4 (PDF target) */}
          <div className="flex justify-center lg:justify-start print:block">
            <div
              ref={pageRef}
              className="engicore-print-page w-[210mm] h-[297mm] max-w-[210mm] max-h-[297mm] bg-white shadow-2xl p-[15mm] overflow-auto print:shadow-none print:w-full print:h-auto print:max-h-none print:overflow-visible"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {logoOk ? (
                    <img
                      src="/materials/logo.png"
                      alt="PL Tecnologia"
                      className="h-12 w-12 rounded object-contain ring-1 ring-slate-200"
                      onError={() => setLogoOk(false)}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-slate-100 ring-1 ring-slate-200" />
                  )}
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{data.company.name}</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Orçamento de Assistência Técnica
                    </p>
                    {[data.company.phone, data.company.instagram].filter(Boolean).length > 0 ? (
                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        {[data.company.phone, data.company.instagram].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">Emissão</p>
                  <p className="text-sm font-black">
                    {new Date(`${data.quote.issueDate}T00:00:00`).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="my-5 h-px w-full bg-slate-200" />

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Cliente</p>
                  <p className="text-sm font-black">{data.client.name || '—'}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {data.client.contact ? `Contato: ${data.client.contact}` : ' '}
                  </p>
                  <p className="text-xs text-slate-600">
                    {[data.client.phone, data.client.email].filter(Boolean).join(' · ') || ' '}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Validade</p>
                  <p className="text-sm font-black">
                    Até {new Date(`${derived.expiresAt}T00:00:00`).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">Mediante recebimento.</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Prazo de entrega</p>
                  <p className="text-sm font-black uppercase tracking-widest">
                    {Math.max(0, Math.floor(toNumber(data.delivery?.daysAfterApproval)))} DIAS ÚTEIS
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">Após aprovação.</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Garantia</p>
                  <p className="text-sm font-black uppercase tracking-widest">
                    {Math.max(0, Math.floor(toNumber(data.warranty?.months)))}{' '}
                    {Math.max(0, Math.floor(toNumber(data.warranty?.months))) === 1 ? 'MÊS' : 'MESES'}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">Serviço executado.</p>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Atendimento</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Equipamento</p>
                    <p className="text-sm font-semibold">{data.service.equipment || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Nº Série</p>
                    <p className="text-sm font-semibold">{data.service.serial || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Reclamação</p>
                    <p className="text-sm font-semibold">{data.service.complaint || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-end justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">INSUMOS</p>
                </div>
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full table-fixed text-left text-[12px]">
                    <colgroup>
                      <col style={{ width: '55%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '17.5%' }} />
                      <col style={{ width: '17.5%' }} />
                    </colgroup>
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-3 py-2">Descrição</th>
                        <th className="px-3 py-2 text-right">Qtd</th>
                        <th className="px-3 py-2 text-right">Unit.</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sortedSupplies.map((it) => {
                        const lineTotal = toNumber(it.qty) * toNumber(it.unitPrice);
                        return (
                          <tr key={it.id} className="bg-white">
                            <td className="px-3 py-2 font-semibold">{it.description || '—'}</td>
                            <td className="px-3 py-2 text-right font-mono">{toNumber(it.qty)}</td>
                            <td className="px-3 py-2 text-right font-mono">{BRL.format(toNumber(it.unitPrice))}</td>
                            <td className="px-3 py-2 text-right font-mono">{BRL.format(lineTotal)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-200">
                        <td className="px-3 py-2 font-black" colSpan={3}>
                          Total de insumos
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-black text-slate-900">
                          {BRL.format(derived.suppliesSubtotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">SERVIÇOS</p>
                </div>
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full table-fixed text-left text-[12px]">
                    <colgroup>
                      <col style={{ width: '55%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '17.5%' }} />
                      <col style={{ width: '17.5%' }} />
                    </colgroup>
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-3 py-2">Descrição</th>
                        <th className="px-3 py-2 text-right">Qtd</th>
                        <th className="px-3 py-2 text-right">Unit.</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sortedServices.map((it) => {
                        const lineTotal = toNumber(it.qty) * toNumber(it.unitPrice);
                        return (
                          <tr key={it.id} className="bg-white">
                            <td className="px-3 py-2 font-semibold">{it.description || '—'}</td>
                            <td className="px-3 py-2 text-right font-mono">{toNumber(it.qty)}</td>
                            <td className="px-3 py-2 text-right font-mono">{BRL.format(toNumber(it.unitPrice))}</td>
                            <td className="px-3 py-2 text-right font-mono">{BRL.format(lineTotal)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-200">
                        <td className="px-3 py-2 font-black" colSpan={3}>
                          Total de serviços
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-black text-slate-900">
                          {BRL.format(derived.servicesSubtotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Observações</p>
                  <p className="mt-1 text-[12px] font-semibold leading-snug text-slate-700 whitespace-pre-wrap">
                    {data.notes || '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Resumo</p>
                  </div>
                  <div className="mt-3 space-y-1.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-600">Total de insumos</span>
                      <span className="font-mono font-black">{BRL.format(derived.suppliesSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-600">Total de serviços</span>
                      <span className="font-mono font-black">{BRL.format(derived.servicesSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-600">Mão de obra</span>
                      <span className="font-mono font-black">{BRL.format(derived.laborSubtotal)}</span>
                    </div>
                    <div className="my-3 h-px w-full bg-slate-200" />
                    <div className="flex justify-between">
                      <span className="text-sm font-black uppercase tracking-widest text-slate-800">Total</span>
                      <span className="text-sm font-black">{BRL.format(derived.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-10 px-6 pt-2">
                <div className="text-center">
                  <div className="mb-2 h-px w-full bg-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</p>
                  <p className="text-sm font-black uppercase tracking-tight text-slate-900">{data.client.name || '—'}</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 h-px w-full bg-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PL Tecnologia</p>
                  <p className="text-sm font-black uppercase tracking-tight text-slate-900">Pedro Luz</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
