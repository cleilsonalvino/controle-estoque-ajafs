// context/SalesContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "@/lib/api"; // seu axios configurado
import type { SaleItem } from "@/pages/Sales";

export interface Product {
  id: string;
  nome: string;
  preco: number;
}

export interface Sale {
  id: string;
  numero: string;
  cliente: string;
  total: number;
  itens: SaleItem[];
  criadoEm?: string;
}

interface SalesContextProps {
  sales: Sale[];
  products: Product[];
  loading: boolean;
  fetchSales: () => Promise<void>;
  createSale: (cliente: string, itens: SaleItem[]) => Promise<Sale>;
  updateSale: (id: string, cliente: string, itens: SaleItem[]) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
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
  const [products, setProducts] = useState<Product[]>([]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/vendas");
      setSales(response.data);
    } catch (err) {
      console.error("Erro ao buscar vendas:", err);
    } finally {
      setLoading(false);
    }
  };

   const fetchProducts = async () => {
    try {
      const response = await axios.get("/produtos");
      setProducts(response.data);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    }
  };

  const createSale = async (cliente: string, itens: SaleItem[]) => {
    const response = await axios.post("/vendas/create", { cliente, itens });
    setSales((prev) => [response.data, ...prev]);
    return response.data;
  };

  const updateSale = async (id: string, cliente: string, itens: SaleItem[]) => {
    const response = await axios.put(`/vendas/${id}`, { cliente, itens });
    setSales((prev) => prev.map((s) => (s.id === id ? response.data : s)));
    return response.data;
  };

  const deleteSale = async (id: string) => {
    await axios.delete(`/vendas/${id}`);
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  // Carrega as vendas ao montar o provider
  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  return (
    <SalesContext.Provider
      value={{ sales, loading, products, fetchSales, createSale, updateSale, deleteSale }}
    >
      {children}
    </SalesContext.Provider>
  );
};
