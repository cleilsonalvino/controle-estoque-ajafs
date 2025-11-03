// src/contexts/ServiceSalesContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import axios from "@/lib/api";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ServiceSale {
  id: string;
  clienteId?: string;
  vendedorId: string;
  tipoServicoId: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  criadoEm?: string;
}

export interface ServiceSaleData {
  clienteId?: string;
  vendedorId: string;
  tipoServicoId: string;
  descricao: string;
  itens: {
    servicoId: string;
    quantidade: number;
    precoUnitario: number;
    descricao: string;
  }[];
  valor: number;
  formaPagamento: string;
}

interface ServiceSalesContextProps {
  serviceSales: ServiceSale[];
  loading: boolean;
  fetchServiceSales: () => Promise<void>;
  createServiceSale: (data: ServiceSaleData) => Promise<ServiceSale>;
  deleteServiceSale: (id: string) => Promise<void>;
}

const ServiceSalesContext = createContext<ServiceSalesContextProps | undefined>(
  undefined
);

export const useServiceSales = () => {
  const ctx = useContext(ServiceSalesContext);
  if (!ctx)
    throw new Error("useServiceSales must be used within ServiceSalesProvider");
  return ctx;
};

export const ServiceSalesProvider = ({ children }: { children: ReactNode }) => {
  const [serviceSales, setServiceSales] = useState<ServiceSale[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchServiceSales = useCallback(async () => {
    setLoading(true);
    try {
      // 🔹 Faz a requisição filtrando por tipoVenda = "Serviço"
      const { data } = await axios.get("/vendas/filtro", {
        params: { tipoVenda: "Serviço" },
      });

      // 🔹 Atualiza o estado apenas se vierem dados válidos
      if (Array.isArray(data)) {
        setServiceSales(data);
      } else {
        console.warn("Resposta inesperada da API:", data);
        setServiceSales([]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar vendas de serviços:", err);
      toast.error("Erro ao carregar as vendas de serviços.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createServiceSale = useCallback(
    async (data: ServiceSaleData): Promise<ServiceSale> => {
      try {
        const response = await axios.post<ServiceSale>(
          "/vendas/create-sales-services",
          data
        );
        setServiceSales((prev) => [response.data, ...prev]);
        toast.success("Serviço registrado com sucesso!");
        return response.data;
      } catch (err: any) {
        console.error(err.response?.data?.message || err.message);
        toast.error("Erro ao registrar serviço.");
        throw err;
      }
    },
    []
  );

  const deleteServiceSale = useCallback(async (id: string) => {
    try {
      await axios.delete(`/vendas/servicos/${id}`);
      setServiceSales((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Erro ao excluir serviço:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchServiceSales();
  }, [fetchServiceSales, isAuthenticated]);

  return (
    <ServiceSalesContext.Provider
      value={{
        serviceSales,
        loading,
        fetchServiceSales,
        createServiceSale,
        deleteServiceSale,
      }}
    >
      {children}
    </ServiceSalesContext.Provider>
  );
};
