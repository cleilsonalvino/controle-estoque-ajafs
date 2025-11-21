
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import {api} from "@/lib/api";
import { useAuth } from "./useAuth";

export interface Vendedor {
  id: string;
  codigo?: string;
  nome: string;
  email: string;
  meta: number;
  urlImagem?: string | File | null; // ✅ CORRETO
  criadoEm?: Date;
  atualizadoEm?: Date;
}


interface VendedorContextProps {
  vendedores: Vendedor[];
  loading: boolean;
  fetchVendedores: () => Promise<void>;
  createVendedor: (data: FormData) => Promise<Vendedor>;
  updateVendedor: (id: string, data: FormData) => Promise<Vendedor>;
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
  const { isAuthenticated } = useAuth();

  const fetchVendedores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/vendedores");
      setVendedores(response.data);
    } catch (err) {
      console.error("Erro ao buscar vendedores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

const createVendedor = useCallback(async (formData: FormData) => {
  try {
    const response = await api.post("/vendedores/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setVendedores((prev) => [response.data, ...prev]);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar vendedor:", error);
    throw error;
  }
}, []);


const updateVendedor = useCallback(async (id: string, formData: FormData) => {
  try {
    const response = await api.put(`/vendedores/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setVendedores((prev) =>
      prev.map((v) => (v.id === id ? response.data : v))
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar vendedor:", error);
    throw error;
  }
}, []);


  const deleteVendedor = useCallback(async (id: string) => {
    await api.delete(`/vendedores/${id}`);
    setVendedores((prev) => prev.filter((v) => v.id !== id));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchVendedores();
    }
  }, [fetchVendedores, isAuthenticated]);

  return (
    <VendedorContext.Provider
      value={{ vendedores, loading, fetchVendedores, createVendedor, updateVendedor, deleteVendedor }}
    >
      {children}
    </VendedorContext.Provider>
  );
};
