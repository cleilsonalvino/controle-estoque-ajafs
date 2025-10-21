import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api"; // já configurado no seu projeto
import { toast } from "sonner"; // opcional, se quiser mostrar notificações


export interface Lote {
  id: string;
  precoCusto: number,
  dataCompra: Date,
  fornecedor:{
    nome: string
  },
  validade: string | null;
  quantidadeAtual: number;
}

// types.ts ou dentro do contexto mesmo
export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  precoVenda: string;
  estoqueMinimo: string;
  categoria: {
    id: string;
    nome: string;
  };
  image?: string;
  criadoEm: Date;
  lote: Lote[];
}

interface ProdutoContextType {
  produtos: Produto[];
  loading: boolean;
  fetchProdutos: () => Promise<void>;
  getProdutoById: (id: string) => Promise<Produto | undefined>;
  createProduto: (novoProduto: Omit<Produto, "id">) => Promise<Produto | undefined>;
  updateProduto: (id: string, produtoAtualizado: Omit<Produto, "id">) => Promise<Produto | undefined>;
  deleteProduto: (id: string) => Promise<void>;
}

const ProdutoContext = createContext<ProdutoContextType>({
  produtos: [],
  loading: false,
  fetchProdutos: async () => {},
  getProdutoById: async () => undefined,
  createProduto: async () => undefined,
  updateProduto: async () => undefined,
  deleteProduto: async () => {},
});

interface ProdutoProviderProps {
  children: ReactNode;
}

export const ProdutoProvider = ({ children }: ProdutoProviderProps) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Produto[]>("/produtos");
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const getProdutoById = async (id: string) => {
    try {
      const { data } = await api.get<Produto>(`/produtos/${id}`);
      return data;
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      toast.error("Erro ao buscar produto");
    }
  };

    const createProduto = async (novoProduto: Omit<Produto, "id">) => {
      try {
        const produtoParaEnviar = {
          nome: novoProduto.nome,
          descricao: novoProduto.descricao,
          precoVenda: Number(novoProduto.precoVenda),
          estoqueMinimo: Number(novoProduto.estoqueMinimo),
          categoriaId: novoProduto.categoria.id,
        };

        console.log("Produto para enviar:", produtoParaEnviar);


        const { data } = await api.post<Produto>("/produtos/create", produtoParaEnviar);
        setProdutos((prev) => [...prev, data]);
        toast.success("Produto criado com sucesso!");
        return data;
      } catch (error) {
        console.error("Erro ao criar produto:", error);
        toast.error("Erro ao criar produto");
      }
    };

  const updateProduto = async (id: string, produtoAtualizado: Omit<Produto, "id">) => {
    try {
      const produtoParaEnviar = {
        nome: produtoAtualizado.nome,
        descricao: produtoAtualizado.descricao,
        precoVenda: Number(produtoAtualizado.precoVenda),
        estoqueMinimo: Number(produtoAtualizado.estoqueMinimo),
        categoriaId: produtoAtualizado.categoria.id || "categoria_padrao",
      };

      const { data } = await api.patch<Produto>(`/produtos/${id}`, produtoParaEnviar);
      setProdutos((prev) => prev.map((p) => (p.id === id ? data : p)));
      toast.success("Produto atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Erro ao atualizar produto");
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      await api.delete(`/produtos/delete/${id}`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produto removido!");
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      toast.error("Erro ao deletar produto");
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return (
    <ProdutoContext.Provider
      value={{
        produtos,
        loading,
        fetchProdutos,
        getProdutoById,
        createProduto,
        updateProduto,
        deleteProduto,
      }}
    >
      {children}
    </ProdutoContext.Provider>
  );
};

export const useProdutos = () => useContext(ProdutoContext);
