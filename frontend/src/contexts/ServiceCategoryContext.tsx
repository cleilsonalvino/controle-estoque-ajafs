
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {api} from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface ServiceCategory {
  id: string;
  nome: string;
}

interface ServiceCategoryContextType {
  serviceCategories: ServiceCategory[];
  loading: boolean;
  fetchServiceCategories: () => Promise<void>;
  createServiceCategory: (newCategory: Omit<ServiceCategory, "id">) => Promise<ServiceCategory | undefined>;
  updateServiceCategory: (id: string, updatedCategory: Omit<ServiceCategory, "id">) => Promise<ServiceCategory | undefined>;
  deleteServiceCategory: (id: string) => Promise<void>;
}

const ServiceCategoryContext = createContext<ServiceCategoryContextType>({
  serviceCategories: [],
  loading: false,
  fetchServiceCategories: async () => {},
  createServiceCategory: async () => undefined,
  updateServiceCategory: async () => undefined,
  deleteServiceCategory: async () => {},
});

interface ServiceCategoryProviderProps {
  children: ReactNode;
}

export const ServiceCategoryProvider = ({ children }: ServiceCategoryProviderProps) => {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchServiceCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<ServiceCategory[]>("/categorias-servicos");
      setServiceCategories(data);
    } catch (error) {
      console.error("Erro ao buscar categorias de serviço:", error);
      toast.error("Erro ao carregar categorias de serviço");
    } finally {
      setLoading(false);
    }
  }, []);

  const createServiceCategory = useCallback(async (newCategory: Omit<ServiceCategory, "id">) => {
    try {
      const { data } = await api.post<ServiceCategory>("/categorias-servicos/create", newCategory);
      setServiceCategories((prev) => [...prev, data]);
      toast.success("Categoria de serviço criada com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao criar categoria de serviço:", error);
      toast.error("Erro ao criar categoria de serviço");
    }
  }, []);

  const updateServiceCategory = useCallback(async (id: string, updatedCategory: Omit<ServiceCategory, "id">) => {
    try {
      const { data } = await api.put<ServiceCategory>(`/categorias-servicos/${id}`, updatedCategory);
      setServiceCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
      toast.success("Categoria de serviço atualizada com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao atualizar categoria de serviço:", error);
      toast.error("Erro ao atualizar categoria de serviço");
    }
  }, []);

  const deleteServiceCategory = useCallback(async (id: string) => {
    try {
      await api.delete(`/categorias-servicos/${id}`);
      setServiceCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Categoria de serviço removida!");
    } catch (error){
      console.error("Erro ao deletar categoria de serviço:", error);
      toast.error("Erro ao deletar categoria de serviço");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServiceCategories();
    }
  }, [fetchServiceCategories, isAuthenticated]);

  return (
    <ServiceCategoryContext.Provider
      value={{
        serviceCategories,
        loading,
        fetchServiceCategories,
        createServiceCategory,
        updateServiceCategory,
        deleteServiceCategory,
      }}
    >
      {children}
    </ServiceCategoryContext.Provider>
  );
};

export const useServiceCategories = () => useContext(ServiceCategoryContext);
