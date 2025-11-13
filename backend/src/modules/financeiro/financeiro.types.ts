
import { ContaPagar, ContaReceber, MovimentacaoFinanceira } from "@prisma/client";

export interface DashboardFinanceiro {
  totalEntradasMes: number;
  totalSaidasMes: number;
  lucroLiquidoMes: number;
  saldoTotalContas: number;
  contasPagarProximos7Dias: ContaPagar[];
  contasReceberProximos7Dias: ContaReceber[];
  ultimasMovimentacoes: MovimentacaoFinanceira[];
  fluxoCaixaMensal: {
    mes: string;
    entradas: number;
    saidas: number;
  }[];
  despesasPorCategoria: {
    categoria: string;
    total: number;
  }[];
  receitasPorCategoria: {
    categoria: string;
    total: number;
  }[];
}
