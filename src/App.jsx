import { lazy, Suspense, useState } from 'react';
import { ArrowRight, FileCog, Home, Wrench } from 'lucide-react';

const TechnicalAssistanceQuote = lazy(() => import('./features/technical/TechnicalAssistanceQuote'));
const ConsultingQuote = lazy(() => import('./features/consulting/ConsultingQuote'));

const DOCUMENTS = [
  {
    id: 'technical',
    title: 'Orçamento de Assistência Técnica',
    description: 'Peças, insumos, mão de obra, serviços e geração do orçamento técnico atual.',
    icon: Wrench,
    accent: 'bg-blue-600',
  },
  {
    id: 'consulting',
    title: 'Proposta de Assessoria Especializada',
    description: 'Escopo modular de engenharia, cronograma, investimento e proposta multipágina.',
    icon: FileCog,
    accent: 'bg-amber-500',
  },
];

function HomeScreen({ onSelect }) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center gap-4">
          <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-white p-2 shadow-2xl shadow-blue-950/40">
            <img src="/materials/logo.jpg" alt="PL Tecnologia" className="max-h-full max-w-full object-contain" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">PL Tecnologia</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Central de propostas</h1>
          </div>
        </header>

        <section className="mb-8 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 ring-1 ring-white/10">
            <Home size={14} /> Escolha o documento
          </div>
          <h2 className="text-3xl font-black leading-tight sm:text-5xl">Qual proposta você quer preparar hoje?</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Cada modelo mantém seu próprio rascunho neste navegador. Você pode alternar entre eles sem misturar os dados.
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {DOCUMENTS.map((document) => (
            <button
              key={document.id}
              type="button"
              onClick={() => onSelect(document.id)}
              className="group flex min-h-64 flex-col items-start rounded-2xl bg-white p-7 text-left text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50"
            >
              <span className={`mb-8 inline-flex h-14 w-14 items-center justify-center rounded-xl text-white ${document.accent}`}>
                <document.icon size={28} />
              </span>
              <span className="text-2xl font-black leading-tight">{document.title}</span>
              <span className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{document.description}</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                Abrir editor <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-slate-400">
          Os rascunhos ficam salvos somente neste computador e neste navegador. PDFs baixados continuam sendo os documentos permanentes.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');

  if (screen === 'technical') return <Suspense fallback={<LoadingScreen />}><TechnicalAssistanceQuote onBack={() => setScreen('home')} /></Suspense>;
  if (screen === 'consulting') return <Suspense fallback={<LoadingScreen />}><ConsultingQuote onBack={() => setScreen('home')} /></Suspense>;
  return <HomeScreen onSelect={setScreen} />;
}

function LoadingScreen() {
  return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm font-black text-white">Carregando editor…</div>;
}
