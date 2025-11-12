// context/SalesContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import {api} from "@/lib/api"; // seu api configurado
import { Produto } from "./ProdutoContext";
import { useAuth } from "./useAuth";

export interface SaleItem {
  id: string;
  produto: Produto;
  precoVenda: number;
  precoCusto: number;
  quantidade: number;
  produtoId?: string;
}

export interface Sale {
  id: string;
  numero: string;
  cliente: {
    id: string;
    nome: string;
    cpf?: string;
  };
  total: string;
  status: string;
  formaPagamento: string;
  desconto: number;
  vendedor: {
    id: string;
    nome: string;
  };
  produto: Produto[];
  itens: SaleItem[];
  criadoEm?: string;
}

export interface SaleData {
  clienteId: string | null;
  vendedorId: string;
  desconto: number;
  formaPagamento: string;
  itens: {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
  }[];
}

interface SalesContextProps {
  sales: Sale[];
  products: Produto[];
  loading: boolean;
  fetchSales: () => Promise<void>;
  createSale: (saleData: SaleData) => Promise<Sale>;
  updateSale: (id: string, cliente: string, itens: SaleItem[]) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
  cancelSale: (id: string) => Promise<void>;
}

const SalesContext = createContext<SalesContextProps | undefined>(undefined);

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) throw new Error("useSales must be used within a SalesProvider");
  return context;
};

interface SalesProviderProps {
  children: ReactNode;
}

export const SalesProvider = ({ children }: SalesProviderProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Produto[]>([]);
  const { isAuthenticated } = useAuth();

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/vendas");
      setSales(response.data);
    } catch (err) {
      console.error("Erro ao buscar vendas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get("/produtos");
      setProducts(response.data);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    }
  }, []);

  const createSale = useCallback(async (saleData: SaleData) => {
    try {
      const response = await api.post("/vendas/create", saleData);
      setSales((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error(err.response?.data.message);
      throw err;
    }
  }, []);

  const updateSale = useCallback(
    async (id: string, cliente: string, itens: SaleItem[]) => {
      const response = await api.put(`/vendas/${id}`, { cliente, itens });
      setSales((prev) => prev.map((s) => (s.id === id ? response.data : s)));
      return response.data;
    },
    []
  );

  const deleteSale = useCallback(async (id: string) => {
    await api.delete(`/vendas/${id}`);
    setSales((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const cancelSale = useCallback(async (id: string) => {
    await api.patch(`/vendas/cancelar/${id}`);
    setSales((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Cancelada" } : s))
    );
  }, []);

  // Carrega as vendas ao montar o provider
  useEffect(() => {
    if (isAuthenticated) {
      fetchSales();
      fetchProducts();
    }
  }, [fetchSales, fetchProducts, isAuthenticated]);

  return (
    <SalesContext.Provider
      value={{
        sales,
        loading,
        products,
        fetchSales,
        createSale,
        updateSale,
        deleteSale,
        cancelSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};
