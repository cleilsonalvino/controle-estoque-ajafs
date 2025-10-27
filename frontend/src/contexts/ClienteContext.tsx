
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/lib/api";

export interface Cliente {
  id: string;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

interface ClienteContextProps {
  clientes: Cliente[];
  loading: boolean;
  fetchClientes: () => Promise<void>;
  createCliente: (clienteData: Omit<Cliente, 'id'>) => Promise<Cliente>;
  updateCliente: (id: string, clienteData: Omit<Cliente, 'id'>) => Promise<Cliente>;
  deleteCliente: (id: string) => Promise<void>;
}

const ClienteContext = createContext<ClienteContextProps | undefined>(undefined);

export const useClientes = () => {
  const context = useContext(ClienteContext);
  if (!context) throw new Error("useClientes must be used within a ClienteProvider");
  return context;
};

interface ClienteProviderProps {
  children: ReactNode;
}

export const ClienteProvider = ({ children }: ClienteProviderProps) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clientes");
      setClientes(response.data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (clienteData: Omit<Cliente, 'id'>) => {
    console.log(clienteData);
    const response = await api.post("/clientes/create", clienteData);
    setClientes((prev) => [response.data, ...prev]);
    return response.data;
  };

  const updateCliente = async (id: string, clienteData: Omit<Cliente, 'id'>) => {
    const response = await api.put(`/clientes/${id}`, clienteData);
    setClientes((prev) => prev.map((c) => (c.id === id ? response.data : c)));
    return response.data;
  };

  const deleteCliente = async (id: string) => {
    await api.delete(`/clientes/${id}`);
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <ClienteContext.Provider
      value={{ clientes, loading, fetchClientes, createCliente, updateCliente, deleteCliente }}
    >
      {children}
    </ClienteContext.Provider>
  );
};
