// src/types/financeiro.ts

export interface FinanceiroSummary {
  saldoAtual: number;
  totalEntradas: number;
  totalSaidas: number;
  lucroLiquido: number;
  contasPagar: number;
  contasReceber: number;
}

export interface Movimentacao {
  id: string;
  tipo: "entrada" | "saida";
  categoria: string;
  descricao: string;
  valor: number;
  status: "pago" | "pendente" | "cancelado";
  contaBancaria: string;
  data: string;
  usuario: string;
}

export interface Conta {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: "pago" | "pendente" | "atrasado";
}

export interface ContaPagar extends Conta {
  fornecedor: string;
  parcela?: string;
}

export interface ContaReceber extends Conta {
  cliente: string;
}

export interface ContaBancaria {
  id: string;
  nome: string;
  saldo: number;
  tipo: string;
  banco?: string;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: "entrada" | "saida";
  status: "ativa" | "inativa";
}
