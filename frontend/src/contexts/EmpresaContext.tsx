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
  nome: string;
  cnpj: string;
  telefone: string;
  email?: string | null;
  urlImage?: string | null;
  razaoSocial: string;
  nomeFantasia: string;
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
}

// 📊 Dados do dashboard
export interface DashboardStats {
  totalEmpresas: number;
  totalUsuarios: number;
  totalProdutos: number;
  totalVendas: number;
  topEmpresas: any[];
  vendasMensais: {
    empresa: string;
    mes: string;
    total: number;
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
        if (key === 'urlImage' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const { data } = await api.post<Empresa>("/empresa", formData, {
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
        if (key === 'urlImage' && value instanceof File) {
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
