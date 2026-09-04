export const CONSULTING_QUOTE_KEY = 'pl-tecnologia.consulting-quote.v1';
export const CONSULTING_MODULES_KEY = 'pl-tecnologia.consulting-modules.v1';

export function makeId(prefix = 'item') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export const COMPANY = {
  name: 'PL Tecnologia',
  responsible: 'Pedro Luz',
  email: 'phmltecnologia@gmail.com',
  phone: '(48) 99163-6944',
};

export const DEFAULT_MODULES = [
  {
    id: 'properties-descriptions',
    title: 'Padronização de peças e montagens',
    description: 'Organizar as informações que aparecem nas peças e montagens, como código, descrição, material e revisão.',
    workload: 0,
    duration: 0,
    durationUnit: 'dias úteis',
    investment: 0,
    position: 1,
  },
  {
    id: 'solidworks-templates',
    title: 'Modelos padrão dos documentos',
    description: 'Criar modelos prontos para peças, montagens e desenhos 2D, deixando os documentos com o mesmo padrão.',
    workload: 0,
    duration: 0,
    durationUnit: 'dias úteis',
    investment: 0,
    position: 2,
  },
  {
    id: 'project-coding',
    title: 'Organização e identificação dos projetos',
    description: 'Definir uma forma simples de identificar e organizar os projetos, facilitando encontrar a versão correta de cada arquivo.',
    workload: 0,
    duration: 0,
    durationUnit: 'dias úteis',
    investment: 0,
    position: 3,
  },
  {
    id: 'nas-structure',
    title: 'Organização dos arquivos no servidor',
    description: 'Organizar as pastas no servidor da empresa e definir quem pode acessar cada tipo de arquivo.',
    workload: 0,
    duration: 0,
    durationUnit: 'dias úteis',
    investment: 0,
    position: 4,
  },
  {
    id: 'macros-automation',
    title: 'Automação de tarefas',
    description: 'Criar automações para gerar listas de peças e exportar desenhos em DXF e PDF.',
    workload: 0,
    duration: 0,
    durationUnit: 'dias úteis',
    investment: 0,
    position: 5,
  },
];

export function cloneDefaultModules() {
  return structuredClone(DEFAULT_MODULES);
}

export function getInvestmentSummary(modules) {
  const priced = modules.filter((module) => Number(module.investment) > 0);
  const unpriced = modules.filter((module) => Number(module.investment) <= 0);
  return {
    priced,
    unpriced,
    total: priced.reduce((sum, module) => sum + Number(module.investment), 0),
    label: priced.length === 0 ? 'Investimento total' : unpriced.length > 0 ? 'Total parcial' : 'Investimento total',
  };
}

export function createDefaultQuote() {
  const year = new Date().getFullYear();
  return {
    title: 'Proposta de Assessoria Especializada em Engenharia',
    number: `PLT-AE-${year}-001`,
    issueDate: todayISO(),
    client: {
      name: '',
      document: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
    },
    context: '',
    objective: '',
    executiveSummary: '',
    overallTimeline: '',
    paymentTerms: '',
    assumptions: 'A execução depende da aprovação da proposta e do acesso às informações e arquivos necessários. A organização do servidor considera o NAS já existente.',
    notes: '',
    acceptanceLocation: '',
    selectedModules: [],
  };
}
