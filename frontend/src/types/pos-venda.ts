import { AgendarFollowUpData, CreatePosVenda } from "./pos-venda-dto";

// ==========================================================
// ENUMS ALINHADOS AO BACKEND
// ==========================================================

export type PosVendaStatus = "PENDENTE" | "EM_ANDAMENTO" | "FINALIZADO";

export type TipoAcaoFollowUp =
  | "whatsapp"
  | "ligacao"
  | "email"
  | "visita"
  | "outro";

// ==========================================================
// TIPOS DAS ENTIDADES
// ==========================================================

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

export interface Usuario {
  id: string;
  nome: string;
}

export interface Venda {
  id: string;
  numero?: string;
  vendedor?: Usuario;
  cliente?: Cliente;
  criadoEm: string;
  total?: number;
}

// ==========================================================
// FOLLOW-UP (BACKEND OFICIAL)
// ==========================================================

export interface FollowUp {
  id: string;
  posVendaId: string;
  dataAgendada: string;
  tipoAcao?: string;
  observacao?: string;
  realizado: boolean;
  empresaId: string;
  responsavel: Usuario;
}

// ==========================================================
// FEEDBACK REAL DO BACKEND
// ==========================================================

export interface Feedback {
  id: string;
  avaliacao: number;
  comentario?: string;
  createdAt: string;
}

// ==========================================================
// POS-VENDA (BACKEND REAL)
// ==========================================================

export interface PosVenda {
  id: string;
  venda: Venda;
  cliente: Cliente;
  usuario: Usuario;   // responsável
  empresaId: string;

  status: PosVendaStatus;
  satisfacao?: number;  // média das avaliações

  retornoCliente?: boolean;
  observacoes?: string;

  followUps: FollowUp[];
  feedbacks: Feedback[];

  criadoEm: string;
  atualizadoEm: string;
}

// ==========================================================
// DASHBOARD
// ==========================================================

export interface PosVendaDashboardData {
  mediaSatisfacao: number;
  followUpsPendentes: number;
  followUpsRealizados: number;
  posVendasFinalizadas: number;
  taxaRetorno: number;
}

export interface PosVendaContextType {
  posVendas: PosVenda[];
  dashboardData: PosVendaDashboardData | null;
  loading: boolean;
  error: Error | null;
  fetchPosVendas: (filters?: Record<string, any>) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  findUniquePosVenda: (id: string) => Promise<PosVenda | null>;
  createPosVenda: (data: CreatePosVenda) => Promise<PosVenda | null>;
  updatePosVenda: (
    id: string,
    data: Partial<PosVenda>
  ) => Promise<PosVenda | null>;
  agendarFollowUp: (
    posVendaId: string,
    followUpData: AgendarFollowUpData
  ) => Promise<FollowUp | null>;
  finalizarAtendimento: (posVendaId: string) => Promise<void>;
  enviarPesquisa: (posVendaId: string) => Promise<void>;
}
