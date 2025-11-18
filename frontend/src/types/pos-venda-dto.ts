
import { TipoAcaoFollowUp } from "./pos-venda";

export interface CreatePosVenda {
  vendaId: string;
  clienteId: string;
  observacoes?: string;
}

export interface AgendarFollowUpData {
  dataAgendada: string;
  tipoAcao: TipoAcaoFollowUp;
  observacao?: string;
}
