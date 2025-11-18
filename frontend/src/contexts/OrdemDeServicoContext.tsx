
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "sonner";
import {
  OrdemDeServico,
  OrdemDeServicoContextType,
  UpdateOrdemDeServico,
} from "@/types/ordem-de-servico";
import { api } from "@/lib/api";
import { useEmpresa } from "./EmpresaContext";

const OrdemDeServicoContext = createContext<
  OrdemDeServicoContextType | undefined
>(undefined);

export const OrdemDeServicoProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ordensDeServico, setOrdensDeServico] = useState<OrdemDeServico[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { empresa } = useEmpresa();

  const getAuthHeaders = useCallback(() => {
    if (!empresa) {
      toast.error("Nenhuma empresa selecionada.");
      throw new Error("Nenhuma empresa selecionada.");
    }
    return { "empresa-id": empresa.id };
  }, [empresa]);

  const withApiHandling = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      successMessage?: string,
      errorMessage?: string
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiCall();
        if (successMessage) {
          toast.success(successMessage);
        }
        return result;
      } catch (err: any) {
        console.error(errorMessage, err);
        setError(err);
        toast.error(errorMessage || "Ocorreu um erro.", {
          description: err.response?.data?.message || err.message,
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchOrdensDeServico = useCallback(
    async (filters: any = {}) => {
      const result = await withApiHandling(
        () =>
          api.get("/ordem-de-servico", {
            params: filters,
            headers: getAuthHeaders(),
          }),
        undefined,
        "Erro ao buscar ordens de serviço."
      );
      if (result) {
        setOrdensDeServico(result.data);
      }
    },
    [getAuthHeaders, withApiHandling]
  );

  const findOrdemDeServico = useCallback(
    async (id: string) => {
      const result = await withApiHandling(
        () => api.get(`/ordem-de-servico/${id}`, { headers: getAuthHeaders() }),
        undefined,
        "Erro ao buscar detalhes da ordem de serviço."
      );
      return result ? result.data : null;
    },
    [getAuthHeaders, withApiHandling]
  );

  const updateOrdemDeServico = useCallback(
    async (id: string, data: UpdateOrdemDeServico) => {
      const result = await withApiHandling(
        () =>
          api.put(`/ordem-de-servico/${id}`, data, {
            headers: getAuthHeaders(),
          }),
        "Ordem de serviço atualizada com sucesso!",
        "Erro ao atualizar ordem de serviço."
      );
      if (result) {
        setOrdensDeServico((prev) =>
          prev.map((os) => (os.id === id ? { ...os, ...result.data } : os))
        );
      }
      return result ? result.data : null;
    },
    [getAuthHeaders, withApiHandling]
  );

  return (
    <OrdemDeServicoContext.Provider
      value={{
        ordensDeServico,
        loading,
        error,
        fetchOrdensDeServico,
        findOrdemDeServico,
        updateOrdemDeServico,
      }}
    >
      {children}
    </OrdemDeServicoContext.Provider>
  );
};

export const useOrdemDeServico = (): OrdemDeServicoContextType => {
  const context = useContext(OrdemDeServicoContext);
  if (!context) {
    throw new Error(
      "useOrdemDeServico must be used within a OrdemDeServicoProvider"
    );
  }
  return context;
};
