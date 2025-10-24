import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Supplier {
  id: string;
  nome: string;
  contato: string;
  email: string | null;
  telefone: string;
  endereco: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (newSupplier: Omit<Supplier, "id">) => Promise<Supplier | undefined>;
  updateSupplier: (id: string, updatedSupplier: Omit<Supplier, "id">) => Promise<Supplier | undefined>;
  deleteSupplier: (id: string) => Promise<void>;
}

const SupplierContext = createContext<SupplierContextType>({
  suppliers: [],
  loading: false,
  fetchSuppliers: async () => {},
  createSupplier: async () => undefined,
  updateSupplier: async () => undefined,
  deleteSupplier: async () => {},
});

interface SupplierProviderProps {
  children: ReactNode;
}

export const SupplierProvider = ({ children }: SupplierProviderProps) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Supplier[]>("/fornecedores");
      setSuppliers(data);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (newSupplier: Omit<Supplier, "id">) => {
    try {
      const { data } = await api.post<Supplier>("/fornecedores/create", newSupplier);
      setSuppliers((prev) => [...prev, data]);
      toast.success("Fornecedor criado com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
      toast.error("Erro ao criar fornecedor");
    }
  };

  const updateSupplier = async (id: string, updatedSupplier: Omit<Supplier, "id">) => {
    try {
      const { data } = await api.put<Supplier>(`/fornecedores/${id}`, updatedSupplier);
      setSuppliers((prev) => prev.map((s) => (s.id === id ? data : s)));
      toast.success("Fornecedor atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      toast.error("Erro ao atualizar fornecedor");
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await api.delete(`/fornecedores/${id}`);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      toast.success("Fornecedor removido!");
    } catch (error) {
      console.error("Erro ao deletar fornecedor:", error);
      toast.error("Erro ao deletar fornecedor");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        loading,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => useContext(SupplierContext);
