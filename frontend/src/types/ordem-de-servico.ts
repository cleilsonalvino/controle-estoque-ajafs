import { Cliente, Usuario, Venda, Servico } from "./pos-venda";

export type StatusOrdemDeServico =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

export interface OrdemDeServico {
  id: string;

  // Relacoes
  servico?: Servico | null; // pode ser nulo ate identificar depois
  venda?: Venda | null;
  cliente?: Cliente | null;
  responsavel?: Usuario | null;

  // Infos
  status: StatusOrdemDeServico;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;

  // Campos adicionais que voce ja usa no fluxo
  identificacaoItem?: string; 
  problemaRelatado?: string;
}

export interface CreateOrdemDeServico {
  clienteId: string;
  responsavelId: string;
  identificacaoItem?: string;
  problemaRelatado: string;
  observacoes?: string;
}

export interface UpdateOrdemDeServico {
  responsavelId?: string;
  status?: StatusOrdemDeServico;
  observacoes?: string;
  identificacaoItem?: string;
  problemaRelatado?: string;
}

export interface deleteOrdemDeServico {
  id: string;
}


export interface OrdemDeServicoContextType {
  ordensDeServico: OrdemDeServico[];
  loading: boolean;
  error: Error | null;

  fetchOrdensDeServico: (filters?: any) => Promise<void>;
  findOrdemDeServico: (id: string) => Promise<OrdemDeServico | null>;
  deleteOrdemDeServico: (id: string) => Promise<boolean>;

  createOrdemDeServico: (
    data: CreateOrdemDeServico
  ) => Promise<OrdemDeServico | null>;

  updateOrdemDeServico: (
    id: string,
    data: UpdateOrdemDeServico
  ) => Promise<OrdemDeServico | null>;
}
