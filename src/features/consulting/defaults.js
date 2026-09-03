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
    title: 'Padronização de propriedades e descrições',
    objective: 'Padronizar as propriedades personalizadas e os metadados utilizados em peças e montagens do SolidWorks.',
    activities: [
      'Definir a estrutura de propriedades personalizadas para peças e montagens.',
      'Padronizar código, descrição, material, revisão, responsável e demais metadados aprovados.',
      'Configurar as propriedades nos documentos e validar a aplicação em arquivos de exemplo.',
    ],
    deliverables: [
      'Estrutura padronizada de propriedades e configurações aplicadas.',
      'Guia de preenchimento e utilização.',
      'Documentação específica do módulo.',
    ],
    duration: 0,
    durationUnit: 'dias úteis',
    investment: 0,
    position: 1,
  },
  {
    id: 'solidworks-templates',
    title: 'Templates padrão do SolidWorks',
    objective: 'Criar uma base padronizada para novos documentos de peças, montagens e desenhos 2D.',
    activities: [
      'Configurar templates de peças, montagens e desenhos 2D.',
      'Padronizar unidades, normas, folhas, legendas, estilos, listas de materiais e balões.',
      'Validar a criação de documentos a partir dos novos padrões.',
    ],
    deliverables: [
      'Arquivos de template para peças, montagens e desenhos.',
      'Formatos de folha e legendas configurados.',
      'Documentação de instalação e utilização.',
    ],
    duration: 0,
    durationUnit: 'dias úteis',
    investment: 0,
    position: 2,
  },
  {
    id: 'project-coding',
    title: 'Codificação e estrutura dos projetos',
    objective: 'Estruturar regras de codificação e organização que facilitem a criação, localização e revisão dos arquivos de engenharia.',
    activities: [
      'Definir famílias, regras de numeração, nomenclatura, revisões e estados dos arquivos.',
      'Criar árvore de pastas para projetos, bibliotecas, documentos liberados e arquivos obsoletos.',
      'Aplicar e validar a estrutura em um projeto de exemplo.',
    ],
    deliverables: [
      'Manual de codificação e nomenclatura.',
      'Estrutura de pastas padronizada.',
      'Projeto de exemplo e documentação específica do módulo.',
    ],
    duration: 0,
    durationUnit: 'dias úteis',
    investment: 0,
    position: 3,
  },
  {
    id: 'nas-structure',
    title: 'Estrutura de arquivos e permissões no NAS',
    objective: 'Adequar o NAS existente para organizar os arquivos de engenharia e controlar o acesso dos projetistas.',
    activities: [
      'Implantar no NAS existente a estrutura de pastas definida para a engenharia.',
      'Definir perfis de acesso, permissões e caminhos compartilhados.',
      'Validar o acesso dos projetistas e documentar o fluxo operacional.',
    ],
    deliverables: [
      'Estrutura de pastas implantada no NAS existente.',
      'Matriz de permissões e guia operacional.',
      'Documentação específica do módulo.',
    ],
    exclusions: 'Não inclui fornecimento de hardware, administração completa de rede, implantação de PDM ou coedição simultânea do mesmo arquivo.',
    duration: 0,
    durationUnit: 'dias úteis',
    investment: 0,
    position: 4,
  },
  {
    id: 'macros-automation',
    title: 'Macros e automações',
    objective: 'Reduzir tarefas repetitivas e aumentar a consistência dos fluxos internos de documentação e fabricação.',
    activities: [
      'Mapear os fluxos aprovados de listas de peças e exportações de desenhos.',
      'Implementar geração de DXF e PDF, nomenclatura e processamento em lote.',
      'Instalar, testar e validar as automações com a equipe responsável.',
    ],
    deliverables: [
      'Macros e respectivos códigos-fonte.',
      'Instruções de instalação e utilização.',
      'Registros de testes e documentação específica do módulo.',
    ],
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
    assumptions: 'O início dos trabalhos está sujeito à aprovação formal desta proposta e ao fornecimento dos acessos, informações e arquivos necessários pela contratante.',
    notes: '',
    acceptanceLocation: '',
    selectedModules: [],
  };
}
