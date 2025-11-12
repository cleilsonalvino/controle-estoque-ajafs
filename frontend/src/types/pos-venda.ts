
// Interfaces para o módulo de Pós-Venda

export type PosVendaStatus = "pendente" | "em_andamento" | "finalizado";
export type TipoContato = "whatsapp" | "ligacao" | "email" | "visita";

export interface Venda {
  id: string;
  produtos: Array<{ id: string; nome: string; quantidade: number; preco: number }>;
  valorTotal: number;
  dataVenda: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
}

export interface Usuario {
  id: string;
  nome: string;
}

export interface FollowUp {
  id: string;
  dataContato: string;
  tipoContato: TipoContato;
  observacao: string;
  concluido: boolean;
  responsavel: Usuario;
}

export interface Feedback {
  id: string;
  nota: number; // 1 a 5
  comentario?: string;
  dataFeedback: string;
}

export interface PosVenda {
  id: string;
  cliente: Cliente;
  venda: Venda;
  status: PosVendaStatus;
  dataUltimoContato: string;
  nivelSatisfacao?: number; // Média das notas de feedback
  responsavel: Usuario;
  historicoContatos: FollowUp[];
  anotacoes: string;
  feedback?: Feedback;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

// --- Tipos para o Contexto ---
export interface PosVendaContextType {
  posVendas: PosVenda[];
  dashboardData: PosVendaDashboardData | null;
  loading: boolean;
  error: Error | null;
  fetchPosVendas: (filters?: any) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  findUniquePosVenda: (id: string) => Promise<PosVenda | null>;
  createPosVenda: (data: Partial<PosVenda>) => Promise<PosVenda | null>;
  updatePosVenda: (id: string, data: Partial<PosVenda>) => Promise<PosVenda | null>;
  agendarFollowUp: (posVendaId: string, followUpData: Omit<FollowUp, "id" | "responsavel">) => Promise<FollowUp | null>;
  finalizarAtendimento: (posVendaId: string) => Promise<void>;
  enviarPesquisa: (posVendaId: string) => Promise<void>;
}


// --- Tipos para o Dashboard ---

export interface FollowUpsPorStatus {
  realizados: number;
  pendentes: number;
}

export interface DistribuicaoNotas {
  nota: number;
  quantidade: number;
}

export interface RankingVendedor {
  vendedor: Usuario;
  mediaSatisfacao: number;
  totalAtendimentos: number;
}

export interface Reclamacao {
  id: string;
  cliente: Cliente;
  dataReclamacao: string;
  motivo: string;
}

export interface PosVendaDashboardData {
  mediaGeralSatisfacao: number;
  followUps: FollowUpsPorStatus;
  distribuicaoNotas: DistribuicaoNotas[];
  rankingVendedores: RankingVendedor[];
  taxaFidelizacao: number;
  reclamacoesAbertas: Reclamacao[];
}
