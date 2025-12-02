import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// =====================================
// TYPES BASICOS
// =====================================

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: "entrada" | "saida";
  descricao?: string | null;
  status: "ativa" | "inativa";
  ativo: boolean;
  empresaId: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ContaBancaria {
  id: string;
  nome: string;
  banco?: string | null;
  tipoConta: string;
  saldoInicial: number;
  saldoAtual: number;
  ativo: boolean;
  empresaId: string;
  criadoEm: string;
  atualizadoEm: string;
  observacoes?: string | null;
}

export interface MovimentacaoFinanceira {
  id: string;
  tipo: "ENTRADA" | "SAIDA";
  descricao?: string | null;
  valor: number;
  data: string;
  status: "PENDENTE" | "LIQUIDADA" | "CANCELADA";
  metodoPagamento?: string | null;
  empresaId: string;
  categoriaId: string;
  contaBancariaId: string;
  vendaId?: string | null;
  clienteId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  categoria?: CategoriaFinanceira;
  contaBancaria?: ContaBancaria;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor?: string | null;
  valorTotal: number;
  valorPago?: number;
  dataVencimento?: string;
  dataPagamento?: string | null;
  status: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
  recorrente: boolean;
  periodicidadeRecorrencia?: "SEMANAL" | "MENSAL" | "ANUAL" | null;
  empresaId: string;
  categoriaId: string;
  contaBancariaId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  categoria?: CategoriaFinanceira;
}

export interface ContaReceber {
  id: string;
  descricao: string;
  valorTotal: number;
  valorRecebido: number;
  dataVencimento: string;
  dataRecebimento?: string | null;
  status: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
  recorrente: boolean;
  periodicidadeRecorrencia?: "SEMANAL" | "MENSAL" | "ANUAL" | null;
  empresaId: string;
  categoriaId: string;
  contaBancariaId?: string | null;
  clienteId?: string | null;
  vendaId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  categoria?: CategoriaFinanceira;
  cliente?: {
    id: string;
    nome: string;
  } | null;
}

export interface FluxoCaixaPonto {
  mes: string;
  entradas: number;
  saidas: number;
}

export interface CategoriaResumo {
  categoria: string;
  total: number;
}

export interface DashboardFinanceiro {
  totalEntradasMes: number;
  totalSaidasMes: number;
  lucroLiquidoMes: number;
  saldoTotalContas: number;
  contasPagarProximos7Dias: ContaPagar[];
  contasReceberProximos7Dias: ContaReceber[];
  ultimasMovimentacoes: MovimentacaoFinanceira[];
  fluxoCaixaMensal: FluxoCaixaPonto[];
  despesasPorCategoria: CategoriaResumo[];
  receitasPorCategoria: CategoriaResumo[];
}

// =====================================
// CONTEXT TYPE
// =====================================

interface FinanceiroContextType {
  loading: boolean;
  loadingDashboard: boolean;

  dashboard: DashboardFinanceiro | null;
  movimentacoes: MovimentacaoFinanceira[];
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  contasBancarias: ContaBancaria[];
  categorias: CategoriaFinanceira[];

  // Dashboard
  fetchDashboard: () => Promise<void>;

  // Categorias
  fetchCategorias: (tipo?: "ENTRADA" | "SAIDA") => Promise<void>;
  createCategoria: (
    data: Omit<CategoriaFinanceira, "id" | "empresaId" | "criadoEm" | "atualizadoEm" | "ativo">
  ) => Promise<void>;
  updateCategoria: (
    id: string,
    data: Partial<CategoriaFinanceira>
  ) => Promise<void>;
  archiveCategoria: (id: string) => Promise<void>;

  // Contas bancarias
  fetchContasBancarias: () => Promise<void>;
  createContaBancaria: (
    data: Omit<ContaBancaria, "id" | "empresaId" | "criadoEm" | "atualizadoEm" | "saldoAtual">
  ) => Promise<void>;
  updateContaBancaria: (
    id: string,
    data: Partial<ContaBancaria>
  ) => Promise<void>;
  deleteContaBancaria: (id: string) => Promise<void>;
  transferirEntreContas: (payload: {
    contaOrigemId: string;
    contaDestinoId: string;
    valor: number;
    data: string;
    descricao?: string;
    metodoPagamento?: string;
  }) => Promise<void>;

  // Movimentacoes
  fetchMovimentacoes: (filters?: any) => Promise<void>;
  createMovimentacao: (
    data: Omit<MovimentacaoFinanceira, "id" | "empresaId" | "criadoEm" | "atualizadoEm">
  ) => Promise<void>;
  updateMovimentacao: (
    id: string,
    data: Partial<MovimentacaoFinanceira>
  ) => Promise<void>;
  removeMovimentacao: (id: string) => Promise<void>;

  // Contas a pagar
  fetchContasPagar: (filters?: any) => Promise<void>;
  createContaPagar: (
    data: Omit<ContaPagar, "id" | "empresaId" | "criadoEm" | "atualizadoEm" | "status" | "valorPago">
  ) => Promise<void>;
  updateContaPagar: (
    id: string,
    data: Partial<ContaPagar>
  ) => Promise<void>;
  deleteContaPagar: (id: string) => Promise<void>;
  marcarContaPaga: (payload: {
    id: string;
    valorPago: number;
    dataPagamento: string;
    contaBancariaId: string;
    metodoPagamento?: string;
  }) => Promise<void>;

  // Contas a receber
  fetchContasReceber: (filters?: any) => Promise<void>;
  createContaReceber: (
    data: Omit<ContaReceber, "id" | "empresaId" | "criadoEm" | "atualizadoEm" | "status" | "valorRecebido">
  ) => Promise<void>;
  updateContaReceber: (
    id: string,
    data: Partial<ContaReceber>
  ) => Promise<void>;
  deleteContaReceber: (id: string) => Promise<void>;
  marcarContaRecebida: (payload: {
    id: string;
    valorRecebido: number;
    dataRecebimento: string;
    contaBancariaId: string;
    metodoPagamento?: string;
  }) => Promise<void>;

  // Relatorios
  fetchFluxoCaixaRelatorio: (params: { inicio: string; fim: string }) => Promise<MovimentacaoFinanceira[]>;
  fetchResumoMensalRelatorio: (mes: string) => Promise<{
    mes: string;
    totalEntradas: number;
    totalSaidas: number;
    resultado: number;
  }>;
}

// =====================================
// CONTEXT
// =====================================

const FinanceiroContext = createContext<FinanceiroContextType>({
  loading: false,
  loadingDashboard: false,
  dashboard: null,
  movimentacoes: [],
  contasPagar: [],
  contasReceber: [],
  contasBancarias: [],
  categorias: [],
  fetchDashboard: async () => {},
  fetchCategorias: async () => {},
  createCategoria: async () => {},
  updateCategoria: async () => {},
  archiveCategoria: async () => {},
  fetchContasBancarias: async () => {},
  createContaBancaria: async () => {},
  updateContaBancaria: async () => {},
  deleteContaBancaria: async () => {},
  transferirEntreContas: async () => {},
  fetchMovimentacoes: async () => {},
  createMovimentacao: async () => {},
  updateMovimentacao: async () => {},
  removeMovimentacao: async () => {},
  fetchContasPagar: async () => {},
  createContaPagar: async () => {},
  updateContaPagar: async () => {},
  deleteContaPagar: async () => {},
  marcarContaPaga: async () => {},
  fetchContasReceber: async () => {},
  createContaReceber: async () => {},
  updateContaReceber: async () => {},
  deleteContaReceber: async () => {},
  marcarContaRecebida: async () => {},
  fetchFluxoCaixaRelatorio: async () => [],
  fetchResumoMensalRelatorio: async () => ({
    mes: "",
    totalEntradas: 0,
    totalSaidas: 0,
    resultado: 0,
  }),
});

// =====================================
// PROVIDER
// =====================================

export function FinanceiroProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardFinanceiro | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);

  // -------- DASHBOARD --------
  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingDashboard(true);
      const { data } = await api.get<DashboardFinanceiro>("/financeiro/dashboard");
      setDashboard(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar painel financeiro");
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  // -------- CATEGORIAS --------
  const fetchCategorias = useCallback(
    async (tipo?: "ENTRADA" | "SAIDA") => {
      try {
        setLoading(true);
        const { data } = await api.get<CategoriaFinanceira[]>("/financeiro/categorias", {
          params: tipo ? { tipo } : undefined,
        });
        setCategorias(data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar categorias financeiras");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createCategoria = useCallback(
    async (payload: any) => {
      try {
        setLoading(true);
        await api.post("/financeiro/categorias", payload);
        toast.success("Categoria criada");
        await fetchCategorias();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao criar categoria");
      } finally {
        setLoading(false);
      }
    },
    [fetchCategorias]
  );

  const updateCategoria = useCallback(
    async (id: string, payload: any) => {
      try {
        setLoading(true);
        await api.put(`/financeiro/categorias/${id}`, payload);
        toast.success("Categoria atualizada");
        await fetchCategorias();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao atualizar categoria");
      } finally {
        setLoading(false);
      }
    },
    [fetchCategorias]
  );

  const archiveCategoria = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await api.delete(`/financeiro/categorias/${id}`);
        toast.success("Categoria arquivada");
        await fetchCategorias();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao arquivar categoria");
      } finally {
        setLoading(false);
      }
    },
    [fetchCategorias]
  );

  // -------- CONTAS BANCARIAS --------
  const fetchContasBancarias = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get<ContaBancaria[]>("/financeiro/contas-bancarias");
      console.log(data);
      setContasBancarias(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar contas bancarias");
    } finally {
      setLoading(false);
    }
  }, []);

  const createContaBancaria = useCallback(
    async (payload: any) => {
      try {
        setLoading(true);
        await api.post("/financeiro/contas-bancarias", payload);
        toast.success("Conta bancaria criada");
        await fetchContasBancarias();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao criar conta bancaria");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasBancarias]
  );

  const updateContaBancaria = useCallback(
    async (id: string, payload: any) => {
      try {
        setLoading(true);
        await api.put(`/financeiro/contas-bancarias/${id}`, payload);
        toast.success("Conta bancaria atualizada");
        await fetchContasBancarias();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao atualizar conta bancaria");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasBancarias]
  );

  const deleteContaBancaria = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await api.delete(`/financeiro/contas-bancarias/${id}`);
        toast.success("Conta bancaria removida");
        await fetchContasBancarias();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao remover conta bancaria");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasBancarias]
  );

  const transferirEntreContas = useCallback(
    async (payload: any) => {
      try {
        setLoading(true);
        await api.post("/financeiro/contas-bancarias/transferir", payload);
        toast.success("Transferencia realizada");
        await fetchContasBancarias();
        await fetchDashboard();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao transferir entre contas");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasBancarias, fetchDashboard]
  );

  // -------- MOVIMENTACOES --------
  const fetchMovimentacoes = useCallback(
    async (filters?: any) => {
      try {
        setLoading(true);
        const { data } = await api.get<MovimentacaoFinanceira[]>("/financeiro/movimentacoes", {
          params: filters,
        });
        setMovimentacoes(data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar movimentacoes");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createMovimentacao = useCallback(
    async (payload: any) => {
      try {
        setLoading(true);
        await api.post("/financeiro/movimentacoes", payload);
        toast.success("Movimentacao criada");
        await Promise.all([fetchMovimentacoes(), fetchDashboard(), fetchContasBancarias()]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao criar movimentacao");
      } finally {
        setLoading(false);
      }
    },
    [fetchMovimentacoes, fetchDashboard, fetchContasBancarias]
  );

  const updateMovimentacao = useCallback(
    async (id: string, payload: any) => {
      try {
        setLoading(true);
        await api.put(`/financeiro/movimentacoes/${id}`, payload);
        toast.success("Movimentacao atualizada");
        await Promise.all([fetchMovimentacoes(), fetchDashboard(), fetchContasBancarias()]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao atualizar movimentacao");
      } finally {
        setLoading(false);
      }
    },
    [fetchMovimentacoes, fetchDashboard, fetchContasBancarias]
  );

  const removeMovimentacao = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await api.delete(`/financeiro/movimentacoes/${id}`);
        toast.success("Movimentacao removida");
        await Promise.all([fetchMovimentacoes(), fetchDashboard(), fetchContasBancarias()]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao remover movimentacao");
      } finally {
        setLoading(false);
      }
    },
    [fetchMovimentacoes, fetchDashboard, fetchContasBancarias]
  );

  // -------- CONTAS A PAGAR --------
  const fetchContasPagar = useCallback(
    async (filters?: any) => {
      try {
        setLoading(true);
        const { data } = await api.get<ContaPagar[]>("/financeiro/contas-pagar", {
          params: filters,
        });
        setContasPagar(data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar contas a pagar");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createContaPagar = useCallback(
    async (payload: any) => {
      try {
        setLoading(true);
        await api.post("/financeiro/contas-pagar", payload);
        toast.success("Conta a pagar criada");
        await Promise.all([fetchContasPagar(), fetchDashboard()]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao criar conta a pagar");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasPagar, fetchDashboard]
  );

  const updateContaPagar = useCallback(
    async (id: string, payload: any) => {
      try {
        setLoading(true);
        await api.put(`/financeiro/contas-pagar/${id}`, payload);
        toast.success("Conta a pagar atualizada");
        await Promise.all([fetchContasPagar(), fetchDashboard()]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao atualizar conta a pagar");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasPagar, fetchDashboard]
  );

  const deleteContaPagar = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await api.delete(`/financeiro/contas-pagar/${id}`);
        toast.success("Conta a pagar removida");
        await Promise.all([fetchContasPagar(), fetchDashboard()]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao remover conta a pagar");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasPagar, fetchDashboard]
  );

  const marcarContaPaga = useCallback(
    async (payload: {
      id: string;
      valorPago: number;
      dataPagamento: string;
      contaBancariaId: string;
      metodoPagamento?: string;
    }) => {
      try {
        setLoading(true);
        await api.post(`/financeiro/contas-pagar/${payload.id}/pagar`, payload);
        toast.success("Conta marcada como paga");
        await Promise.all([
          fetchContasPagar(),
          fetchDashboard(),
          fetchContasBancarias(),
        ]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao marcar conta como paga");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasPagar, fetchDashboard, fetchContasBancarias]
  );

  // -------- CONTAS A RECEBER --------
  const fetchContasReceber = useCallback(
    async (filters?: any) => {
      try {
        setLoading(true);
        const { data } = await api.get<ContaReceber[]>("/financeiro/contas-receber", {
          params: filters,
        });
        setContasReceber(data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar contas a receber");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createContaReceber = useCallback(
    async (payload: any) => {
      try {
        setLoading(true);
        await api.post("/financeiro/contas-receber", payload);
        toast.success("Conta a receber criada");
        await Promise.all([fetchContasReceber(), fetchDashboard()]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao criar conta a receber");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasReceber, fetchDashboard]
  );

  const updateContaReceber = useCallback(
    async (id: string, payload: any) => {
      try {
        setLoading(true);
        await api.put(`/financeiro/contas-receber/${id}`, payload);
        toast.success("Conta a receber atualizada");
        await Promise.all([fetchContasReceber(), fetchDashboard()]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao atualizar conta a receber");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasReceber, fetchDashboard]
  );

  const deleteContaReceber = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await api.delete(`/financeiro/contas-receber/${id}`);
        toast.success("Conta a receber removida");
        await Promise.all([fetchContasReceber(), fetchDashboard()]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao remover conta a receber");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasReceber, fetchDashboard]
  );

  const marcarContaRecebida = useCallback(
    async (payload: {
      id: string;
      valorRecebido: number;
      dataRecebimento: string;
      contaBancariaId: string;
      metodoPagamento?: string;
    }) => {
      try {
        setLoading(true);
        await api.post(`/financeiro/contas-receber/${payload.id}/receber`, payload);
        toast.success("Conta marcada como recebida");
        await Promise.all([
          fetchContasReceber(),
          fetchDashboard(),
          fetchContasBancarias(),
        ]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao marcar conta como recebida");
      } finally {
        setLoading(false);
      }
    },
    [fetchContasReceber, fetchDashboard, fetchContasBancarias]
  );

  // -------- RELATORIOS --------
  const fetchFluxoCaixaRelatorio = useCallback(
    async (params: { inicio: string; fim: string }) => {
      try {
        const { data } = await api.get<MovimentacaoFinanceira[]>(
          "/financeiro/relatorios/fluxo-caixa",
          { params }
        );
        return data;
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar relatorio de fluxo de caixa");
        return [];
      }
    },
    []
  );

  const fetchResumoMensalRelatorio = useCallback(
    async (mes: string) => {
      try {
        const { data } = await api.get<{
          mes: string;
          totalEntradas: number;
          totalSaidas: number;
          resultado: number;
        }>("/financeiro/relatorios/resumo-mensal", {
          params: { mes },
        });
        return data;
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar resumo mensal");
        return {
          mes,
          totalEntradas: 0,
          totalSaidas: 0,
          resultado: 0,
        };
      }
    },
    []
  );

  return (
    <FinanceiroContext.Provider
      value={{
        loading,
        loadingDashboard,
        dashboard,
        movimentacoes,
        contasPagar,
        contasReceber,
        contasBancarias,
        categorias,
        fetchDashboard,
        fetchCategorias,
        createCategoria,
        updateCategoria,
        archiveCategoria,
        fetchContasBancarias,
        createContaBancaria,
        updateContaBancaria,
        deleteContaBancaria,
        transferirEntreContas,
        fetchMovimentacoes,
        createMovimentacao,
        updateMovimentacao,
        removeMovimentacao,
        fetchContasPagar,
        createContaPagar,
        updateContaPagar,
        deleteContaPagar,
        marcarContaPaga,
        fetchContasReceber,
        createContaReceber,
        updateContaReceber,
        deleteContaReceber,
        marcarContaRecebida,
        fetchFluxoCaixaRelatorio,
        fetchResumoMensalRelatorio,
      }}
    >
      {children}
    </FinanceiroContext.Provider>
  );
}

// Hook
export const useFinanceiro = () => useContext(FinanceiroContext);
