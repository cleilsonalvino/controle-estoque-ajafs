import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  email?: string | null;
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

interface EmpresaContextType {
  empresa: Empresa | null;
  loading: boolean;
  fetchEmpresa: () => Promise<void>;
  createEmpresa: (
    newEmpresa: Omit<Empresa, "id">
  ) => Promise<Empresa | undefined>;
  updateEmpresa: (
    updatedEmpresa: Partial<Empresa>
  ) => Promise<Empresa | undefined>;
  // ✅ CORREÇÃO: A função deve retornar os dados da empresa ou undefined
  findUniqueEmpresa: (
    empresaId: string
  ) => Promise<Empresa | undefined>;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresa: null,
  loading: false,
  fetchEmpresa: async () => {},
  createEmpresa: async () => undefined,
  updateEmpresa: async () => undefined,
  // ✅ CORREÇÃO: Atualiza o valor padrão do contexto
  findUniqueEmpresa: async () => undefined,
});

interface EmpresaProviderProps {
  children: ReactNode;
}

export const EmpresaProvider = ({ children }: EmpresaProviderProps) => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(false);

  // Esta função busca a empresa "principal" ou "logada" e salva globalmente
  const fetchEmpresa = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Empresa>("/empresa");
      setEmpresa(data);
    } catch (error) {
      console.error("Erro ao buscar dados da empresa:", error);
      // It's okay if it fails, it might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const createEmpresa = async (newEmpresa: Omit<Empresa, "id">) => {
    try {
      const { data } = await api.post<Empresa>("/empresa/create", newEmpresa);
      setEmpresa(data);
      toast.success("Dados da empresa criados com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao criar dados da empresa:", error);
      toast.error("Erro ao criar dados da empresa");
    }
  };

  const updateEmpresa = async (updatedEmpresa: Partial<Empresa>) => {
    try {
      const { data } = await api.put<Empresa>("/empresa", updatedEmpresa);
      setEmpresa(data);
      toast.success("Dados da empresa atualizados com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao atualizar dados da empresa:", error);
      toast.error("Erro ao atualizar dados da empresa");
    }
  };

  // ✅ CORREÇÃO: Esta função agora busca uma empresa específica e RETORNA os dados
  const findUniqueEmpresa = async (
    empresaId: string
  ): Promise<Empresa | undefined> => {
    try {
      const { data } = await api.get<Empresa>(`/empresa/${empresaId}`);
      // ❌ NÃO ATUALIZE O ESTADO GLOBAL AQUI:
      // setEmpresa(data);
      
      // ✅ RETORNE OS DADOS:
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados da empresa:", error);
      toast.error("Erro ao buscar dados da empresa");
      // Propaga o erro para o componente (HomePage) poder tratar
      throw error; 
    }
  };

  return (
    <EmpresaContext.Provider
      value={{
        empresa,
        loading,
        fetchEmpresa,
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