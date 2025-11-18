
import { Cliente, Usuario, Venda, Servico } from "./pos-venda";

export type StatusOrdemDeServico =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

export interface OrdemDeServico {
  id: string;
  servico: Servico;
  venda: Venda;
  cliente?: Cliente;
  responsavel?: Usuario;
  status: StatusOrdemDeServico;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UpdateOrdemDeServico {
  responsavelId?: string;
  status?: StatusOrdemDeServico;
  observacoes?: string;
}

export interface OrdemDeServicoContextType {
  ordensDeServico: OrdemDeServico[];
  loading: boolean;
  error: Error | null;
  fetchOrdensDeServico: (filters?: any) => Promise<void>;
  findOrdemDeServico: (id: string) => Promise<OrdemDeServico | null>;
  updateOrdemDeServico: (
    id: string,
    data: UpdateOrdemDeServico
  ) => Promise<OrdemDeServico | null>;
}
