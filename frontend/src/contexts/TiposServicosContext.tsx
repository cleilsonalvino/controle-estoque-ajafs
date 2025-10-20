import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export interface TipoServico {
  id: string;
  nome: string;
  descricao: string;
  precoCusto: number | 0;
  precoVenda: number | 0;
  duracaoMinutos: number | 0;
  categoriaId: string | null;
}

interface TipoServicoContextType {
  tiposServicos: TipoServico[];
  loading: boolean;
  fetchTiposServicos: () => Promise<void>;
  createTipoServico: (newTipoServico: Omit<TipoServico, "id">) => Promise<TipoServico | undefined>;
  updateTipoServico: (id: string, updatedTipoServico: Omit<TipoServico, "id">) => Promise<TipoServico | undefined>;
  deleteTipoServico: (id: string) => Promise<void>;
}

const TipoServicoContext = createContext<TipoServicoContextType>({
  tiposServicos: [],
  loading: false,
  fetchTiposServicos: async () => {},
  createTipoServico: async () => undefined,
  updateTipoServico: async () => undefined,
  deleteTipoServico: async () => {},
});

interface TipoServicoProviderProps {
  children: ReactNode;
}

export const TipoServicoProvider = ({ children }: TipoServicoProviderProps) => {
  const [tiposServicos, setTiposServicos] = useState<TipoServico[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTiposServicos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<TipoServico[]>("/servicos");
      setTiposServicos(data);
    } catch (error) {
      console.error("Erro ao buscar tipos de serviços:", error);
      toast.error("Erro ao carregar tipos de serviços");
    } finally {
      setLoading(false);
    }
  };

  const createTipoServico = async (newTipoServico: Omit<TipoServico, "id">) => {
    try {
      const { data } = await api.post<TipoServico>("/servicos/create", newTipoServico);
      setTiposServicos((prev) => [...prev, data]);
      toast.success("Tipo de serviço criado com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao criar tipo de serviço:", error);
      toast.error("Erro ao criar tipo de serviço");
    }
  };

  const updateTipoServico = async (id: string, updatedTipoServico: Omit<TipoServico, "id">) => {
    try {
      const { data } = await api.patch<TipoServico>(`/servicos/${id}`, updatedTipoServico);
      setTiposServicos((prev) => prev.map((ts) => (ts.id === id ? data : ts)));
      toast.success("Tipo de serviço atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao atualizar tipo de serviço:", error);
      toast.error("Erro ao atualizar tipo de serviço");
    }
  };

  const deleteTipoServico = async (id: string) => {
    try {
      await api.delete(`/servicos/${id}`);
      setTiposServicos((prev) => prev.filter((ts) => ts.id !== id));
      toast.success("Tipo de serviço removido!");
    } catch (error){
      console.error("Erro ao deletar tipo de serviço:", error);
      toast.error("Erro ao deletar tipo de serviço");
    }
  };

  useEffect(() => {
    fetchTiposServicos();
  }, []);

  return (
    <TipoServicoContext.Provider
      value={{
        tiposServicos,
        loading,
        fetchTiposServicos,
        createTipoServico,
        updateTipoServico,
        deleteTipoServico,
      }}
    >
      {children}
    </TipoServicoContext.Provider>
  );
};

export const useTiposServicos = () => useContext(TipoServicoContext);
