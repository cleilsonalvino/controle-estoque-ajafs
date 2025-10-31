
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  createEmpresa: (newEmpresa: Omit<Empresa, "id">) => Promise<Empresa | undefined>;
  updateEmpresa: (updatedEmpresa: Partial<Empresa>) => Promise<Empresa | undefined>;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresa: null,
  loading: false,
  fetchEmpresa: async () => {},
  createEmpresa: async () => undefined,
  updateEmpresa: async () => undefined,
});

interface EmpresaProviderProps {
  children: ReactNode;
}

export const EmpresaProvider = ({ children }: EmpresaProviderProps) => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(false);

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


  return (
    <EmpresaContext.Provider
      value={{
        empresa,
        loading,
        fetchEmpresa,
        createEmpresa,
        updateEmpresa,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
};

export const useEmpresa = () => useContext(EmpresaContext);
