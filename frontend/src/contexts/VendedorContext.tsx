
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/lib/api";

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  meta: number;
}

interface VendedorContextProps {
  vendedores: Vendedor[];
  loading: boolean;
  fetchVendedores: () => Promise<void>;
  createVendedor: (vendedorData: Omit<Vendedor, 'id'>) => Promise<Vendedor>;
  updateVendedor: (id: string, vendedorData: Omit<Vendedor, 'id'>) => Promise<Vendedor>;
  deleteVendedor: (id: string) => Promise<void>;
}

const VendedorContext = createContext<VendedorContextProps | undefined>(undefined);

export const useVendedores = () => {
  const context = useContext(VendedorContext);
  if (!context) throw new Error("useVendedores must be used within a VendedorProvider");
  return context;
};

interface VendedorProviderProps {
  children: ReactNode;
}

export const VendedorProvider = ({ children }: VendedorProviderProps) => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVendedores = async () => {
    setLoading(true);
    try {
      const response = await api.get("/vendedores");
      setVendedores(response.data);
    } catch (err) {
      console.error("Erro ao buscar vendedores:", err);
    } finally {
      setLoading(false);
    }
  };

  const createVendedor = async (vendedorData: Omit<Vendedor, 'id'>) => {
    const response = await api.post("/vendedores", vendedorData);
    setVendedores((prev) => [response.data, ...prev]);
    return response.data;
  };

  const updateVendedor = async (id: string, vendedorData: Omit<Vendedor, 'id'>) => {
    const response = await api.put(`/vendedores/${id}`, vendedorData);
    setVendedores((prev) => prev.map((v) => (v.id === id ? response.data : v)));
    return response.data;
  };

  const deleteVendedor = async (id: string) => {
    await api.delete(`/vendedores/${id}`);
    setVendedores((prev) => prev.filter((v) => v.id !== id));
  };

  useEffect(() => {
    fetchVendedores();
  }, []);

  return (
    <VendedorContext.Provider
      value={{ vendedores, loading, fetchVendedores, createVendedor, updateVendedor, deleteVendedor }}
    >
      {children}
    </VendedorContext.Provider>
  );
};
