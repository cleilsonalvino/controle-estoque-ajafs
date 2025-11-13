// src/contexts/FinanceiroContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import {
  FinanceiroSummary,
  Movimentacao,
  ContaPagar,
  ContaReceber,
  ContaBancaria,
  CategoriaFinanceira,
} from "@/types/financeiro";

interface FinanceiroContextType {
  summary: FinanceiroSummary;
  movimentacoes: Movimentacao[];
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  contasBancarias: ContaBancaria[];
  categorias: CategoriaFinanceira[];
  loading: boolean;
  // Add functions to manipulate data later
}

const FinanceiroContext = createContext<FinanceiroContextType | undefined>(
  undefined
);

export const FinanceiroProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);

  // Mock data - will be replaced by API calls
  const [summary] = useState<FinanceiroSummary>({
    saldoAtual: 150000,
    totalEntradas: 50000,
    totalSaidas: 25000,
    lucroLiquido: 25000,
    contasPagar: 5000,
    contasReceber: 12000,
  });

  const [movimentacoes] = useState<Movimentacao[]>([
    { id: "1", tipo: "entrada", categoria: "Venda de Produto", descricao: "Venda do produto X", valor: 1500, status: "pago", contaBancaria: "Conta Principal", data: "2025-11-12", usuario: "Admin" },
    { id: "2", tipo: "saida", categoria: "Fornecedor", descricao: "Pagamento fornecedor Y", valor: 750, status: "pago", contaBancaria: "Conta Principal", data: "2025-11-11", usuario: "Admin" },
    { id: "3", tipo: "entrada", categoria: "Serviço", descricao: "Serviço de manutenção", valor: 500, status: "pago", contaBancaria: "Conta Principal", data: "2025-11-10", usuario: "Admin" },
  ]);
  const [contasPagar] = useState<ContaPagar[]>([
      { id: "1", descricao: "Aluguel", fornecedor: "Imobiliária Z", valor: 1200, vencimento: "2025-11-15", status: "pendente" },
      { id: "2", descricao: "Internet", fornecedor: "Provedor W", valor: 150, vencimento: "2025-11-20", status: "pendente" },
  ]);
  const [contasReceber] = useState<ContaReceber[]>([
      { id: "1", descricao: "Venda parcelada", cliente: "Cliente A", valor: 800, vencimento: "2025-11-18", status: "pendente" },
      { id: "2", descricao: "Serviço prestado", cliente: "Cliente B", valor: 1200, vencimento: "2025-11-25", status: "pendente" },
  ]);
  const [contasBancarias] = useState<ContaBancaria[]>([
    { id: "1", nome: "Conta Principal", saldo: 75000, tipo: "Corrente", banco: "Banco A" },
    { id: "2", nome: "Investimentos", saldo: 50000, tipo: "Investimento", banco: "Corretora B" },
    { id: "3", nome: "Caixa", saldo: 25000, tipo: "Caixa", banco: "N/A" },
  ]);
  const [categorias] = useState<CategoriaFinanceira[]>([
    { id: "1", nome: "Venda de Produto", tipo: "entrada", status: "ativa" },
    { id: "2", nome: "Serviço", tipo: "entrada", status: "ativa" },
    { id: "3", nome: "Fornecedores", tipo: "saida", status: "ativa" },
    { id: "4", nome: "Salários", tipo: "saida", status: "ativa" },
    { id: "5", nome: "Marketing", tipo: "saida", status: "inativa" },
  ]);

  // Simulate loading
  useState(() => {
    setTimeout(() => setLoading(false), 500);
  });

  const value = {
    summary,
    movimentacoes,
    contasPagar,
    contasReceber,
    contasBancarias,
    categorias,
    loading,
  };

  return (
    <FinanceiroContext.Provider value={value}>
      {children}
    </FinanceiroContext.Provider>
  );
};

export const useFinanceiro = () => {
  const context = useContext(FinanceiroContext);
  if (context === undefined) {
    throw new Error("useFinanceiro must be used within a FinanceiroProvider");
  }
  return context;
};
