import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {api} from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/useAuth";

export interface Empresa {
  id: string;
  nome_fantasia: string;
  cnpj: string;
  telefone: string;
  email?: string | null;
  logoEmpresa?: string | null;
  razao_social: string;
  inscEstadual: string;
  inscMunicipal: string;
  cnae: string;
  cep: string;
  estado: string;
  cidade: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  criadoEm: Date;
  atualizadoEm: Date;
  usuario:{
    email: string;
    senha: string;
  }
}

// 📊 Dados do dashboard
// 📊 Dados do dashboard global multiempresa
export interface DashboardStats {
  // 1) Empresas e usuarios
  totalEmpresas: number;
  totalUsuarios: number;
  usuariosPorPapel?: {
    papel: "ADMINISTRADOR" | "USUARIO" | "SUPER_ADMIN" | "VENDEDOR";
    total: number;
  }[];

  // 3) Produtos e estoque
  totalProdutos: number;
  estoqueCritico?: number;
  lotesProximosVencimento?: number;
  movimentacoesEstoqueHoje?: number;

  // 4) Vendas
  totalVendas: number;
  vendasHoje?: number;
  vendasUltimos7Dias?: number;
  ticketMedioGeral?: number;
  vendasMensais: {
    mes: string;              // ex: "2025-01"
    total: number;            // valor total
  }[];
  vendasPorEmpresaMesAtual?: {
    empresaId: string;
    empresaNome: string;
    total: number;
  }[];
  vendasPorFormaPagamento?: {
    forma: string;            // ex: "Pix", "Credito", "Dinheiro"
    total: number;
  }[];
  topEmpresas: {
    id: string;
    nome: string;
    cidade: string;
    totalVendas: number;
  }[];
  topProdutos?: {
    id: string;
    nome: string;
    totalVendido: number;
  }[];
  topVendedores?: {
    id: string;
    nome: string;
    totalVendido: number;
  }[];

  // 5) Financeiro
  saldoFinanceiroGlobal?: number;
  totalContasPagarAbertas?: number;
  totalContasReceberAbertas?: number;
  valorContasPagarAtrasadas?: number;
  valorContasReceberVencendo?: number;
  fluxoCaixaMensal?: {
    competencia: string;      // ex: "2025-01"
    entradas: number;
    saidas: number;
  }[];

  // 6) Clientes
  totalClientes?: number;
  clientesNovosUltimos30Dias?: number;
  topClientes?: {
    id: string;
    nome: string;
    totalComprado: number;
  }[];

  // 7) Ordens de servico
  totalOrdensServico?: number;
  ordensServicoPorStatus?: {
    status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
    quantidade: number;
  }[];

  // 8) Pos venda
  totalPosVendas?: number;
  posVendaPorStatus?: {
    status: "PENDENTE" | "EM_ANDAMENTO" | "FINALIZADO";
    quantidade: number;
  }[];
  satisfacaoMedia?: number; // 0 a 10

  // 10) Fornecedores e lotes
  totalFornecedores?: number;
  totalLotes?: number;

  // 11) Infraestrutura
  apiStatus?: "OK" | "INSTAVEL" | "OFFLINE";
  apiLatenciaMediaMs?: number;
  apiRequests24h?: number;
  apiErros24h?: number;

  // 12) Atividades recentes
  atividadesRecentes?: {
    id: string;
    tipo: string;            // "VENDA", "EMPRESA", "USUARIO", etc
    descricao: string;
    data: string;            // ISO string
    empresaNome?: string;
  }[];
}


interface EmpresaContextType {
  empresa: Empresa | null;
  empresas: Empresa[];
  dashboard: DashboardStats | null;
  loading: boolean;
  loadingList: boolean;

  fetchEmpresa: (empresaId?: string) => Promise<void>;
  fetchEmpresas: () => Promise<void>;
  fetchDashboard: () => Promise<void>;

  createEmpresa: (
    newEmpresa: Omit<Empresa, "id">
  ) => Promise<Empresa | undefined>;
  updateEmpresa: (
    updatedEmpresa: Partial<Empresa>,
    empresaId: string
  ) => Promise<Empresa | undefined>;
  findUniqueEmpresa: (empresaId: string) => Promise<Empresa | undefined>;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresa: null,
  empresas: [],
  dashboard: null,
  loading: false,
  loadingList: false,
  fetchEmpresa: async () => {},
  fetchEmpresas: async () => {},
  fetchDashboard: async () => {},
  createEmpresa: async () => undefined,
  updateEmpresa: async () => undefined,
  findUniqueEmpresa: async () => undefined,
});

export const EmpresaProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // ======================================================
  // 🔹 Buscar lista de todas as empresas (Super Admin)
  // ======================================================
  const fetchEmpresas = async () => {
    try {
      setLoadingList(true);
      const { data } = await api.get("/empresa");
      setEmpresas(Array.isArray(data) ? data : data.empresas || []);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast.error("Erro ao carregar lista de empresas");
    } finally {
      setLoadingList(false);
    }
  };

  // ======================================================
  // 📊 Buscar dados do dashboard global
  // ======================================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/empresa/super/dashboard");

      // ✅ Garante que o valor final é DashboardStats puro
      const stats: DashboardStats = (data?.data ?? data) as DashboardStats;
      setDashboard(stats);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      toast.error("Erro ao carregar dados do painel de gestão");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 🔹 Buscar dados da empresa
  // ======================================================
  const fetchEmpresa = useCallback(
    async (empresaId?: string) => {
      if (!empresaId || empresa?.id === empresaId) return;
      try {
        setLoading(true);
        const { data } = await api.get<Empresa>(`/empresa/${empresaId}`);
        setEmpresa(data);
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  // ======================================================
  // 🔹 Buscar empresa do usuário logado automaticamente
  // ======================================================
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user?.empresa?.id && !empresa) {
      fetchEmpresa(user.empresa.id);
    }
  }, [authLoading, isAuthenticated, user, empresa, fetchEmpresa]);

  // ======================================================
  // 🔹 Criar empresa
  // ======================================================
  const createEmpresa = async (newEmpresa: Omit<Empresa, "id">) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.keys(newEmpresa).forEach(key => {
        const value = (newEmpresa as any)[key];
        if (key === 'logoEmpresa' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const { data } = await api.post<Empresa>("/empresa/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
      });
      setEmpresa(data);
      toast.success("Empresa criada com sucesso!");
      await fetchEmpresas();
      return data;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar empresa");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 🔹 Atualizar empresa
  // ======================================================
  const updateEmpresa = async (
    updatedData: Partial<Empresa>,
    empresaId: string
  ) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.keys(updatedData).forEach(key => {
        const value = (updatedData as any)[key];
        if (key === 'logoEmpresa' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const { data } = await api.put<Empresa>(
        `/empresa/${empresaId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
      );
      setEmpresa(data);
      toast.success("Empresa atualizada com sucesso!");
      return data;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar empresa");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 🔹 Buscar empresa específica (sem alterar o estado global)
  // ======================================================
  const findUniqueEmpresa = async (empresaId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get<Empresa>(`/empresa/${empresaId}`);
      return data || data;
    } catch (error) {
      console.error("Erro ao buscar empresa:", error);
      toast.error("Erro ao buscar empresa");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmpresaContext.Provider
      value={{
        empresa,
        empresas,
        dashboard,
        loading,
        loadingList,
        fetchEmpresa,
        fetchEmpresas,
        fetchDashboard,
        createEmpresa,
        updateEmpresa,
        findUniqueEmpresa,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
};

export const useEmpresa = () => useContext(EmpresaContext);
