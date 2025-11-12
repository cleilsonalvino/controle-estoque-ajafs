import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {api} from "@/lib/api"; // já configurado no seu projeto
import { toast } from "sonner"; // opcional, se quiser mostrar notificações
import { isAxiosError } from "axios";
import { useAuth } from "./useAuth";

export interface Lote {
  id: string;
  precoCusto: number;
  dataCompra: Date;
  fornecedor: {
    nome: string;
  };
  validade: string | null;
  quantidadeAtual: number;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

// types.ts ou dentro do contexto mesmo
export interface Produto {
  id: string;
  nome: string;
  codigoBarras: string;
  descricao?: string | "";
  precoVenda: string;
  quantidadeTotal: number;
  estoqueMinimo: string;
  custoMedio?: string;
  marca?: {
    id: string;
    nome: string;
  };
  categoria: {
    id: string;
    nome?: string;
  };
  urlImage?: string | "";
  criadoEm?: Date;
  atualizadoEm?: Date;
  lote: Lote[];
}

interface ProdutoContextType {
  produtos: Produto[];
  loading: boolean;
  fetchProdutos: () => Promise<void>;
  getProdutoById: (id: string) => Promise<Produto | undefined>;
  createProduto: (
    novoProduto: Omit<Produto, "id" | "codigoBarras">
  ) => Promise<Produto | undefined>;
  updateProduto: (
    id: string,
    produtoAtualizado: Omit<Produto, "id">
  ) => Promise<Produto | undefined>;
  deleteProduto: (id: string) => Promise<void>;
  darBaixaEstoquePorVenda: (
    produtoId: string,
    quantidade: Number
  ) => Promise<void>;
  getEstoqueProdutoId: (id: string) => Promise<number>;
  fetchMarcaProduto: () => Promise<any[]>;
  createMarcaProduto: (nome: string) => Promise<any>;
}

const ProdutoContext = createContext<ProdutoContextType>({
  produtos: [],
  loading: false,
  fetchProdutos: async () => {},
  getProdutoById: async () => undefined,
  createProduto: async () => undefined,
  updateProduto: async () => undefined,
  deleteProduto: async () => {},
  darBaixaEstoquePorVenda: async () => {},
  getEstoqueProdutoId: async () => 0,
  fetchMarcaProduto: async () => [],
  createMarcaProduto: async () => {},
});

interface ProdutoProviderProps {
  children: ReactNode;
}

export const ProdutoProvider = ({ children }: ProdutoProviderProps) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchProdutos = useCallback(async () => {
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
  }, []);

  const fetchMarcaProduto = useCallback(async () => {
    const { data } = await api.get("/produtos/marcas-produtos");
    return data;
  }, []);

  const createMarcaProduto = useCallback(async (nome: string) => {
    try {
      const { data } = await api.post("/produtos/create-marca-produto", { nome });
      return data;
    } catch (error) {
      console.error("Erro ao criar marca:", error);
      toast.error("Erro ao criar marca");
    }
  }, []);


  const getProdutoById = useCallback(async (id: string) => {
    try {
      const { data } = await api.get<Produto>(`/produtos/${id}`);
      return data;
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      toast.error("Erro ao buscar produto");
    }
  }, []);

  const createProduto = useCallback(
    async (novoProduto: Omit<Produto, "id">) => {
      try {
        const produtoParaEnviar = {
          nome: novoProduto.nome,
          descricao: novoProduto.descricao,
          precoVenda: novoProduto.precoVenda,
          estoqueMinimo: Number(novoProduto.estoqueMinimo),
          categoriaId: novoProduto.categoria?.id || null,
          marcaId: novoProduto.marca?.id || null,
          urlImage: novoProduto.urlImage,
          codigoBarras: novoProduto.codigoBarras,
        };

        console.log("Produto para enviar:", produtoParaEnviar);

        const { data } = await api.post<Produto>(
          "/produtos/create",
          produtoParaEnviar
        );

        return data;
      } catch (error: unknown) {
        console.error("Erro ao criar produto:", error);

        // Mensagem específica se for erro do Axios
        if (isAxiosError(error)) {
          const mensagem =
            error.response?.data?.message || "Erro ao criar produto.";
          toast.error(mensagem);
        } else {
          // Qualquer outro erro inesperado
          toast.error("Erro inesperado. Tente novamente.");
        }

        return null; // indica que a criação falhou
      }
    },
    []
  );

  const updateProduto = useCallback(
    async (id: string, produtoAtualizado: Omit<Produto, "id">) => {
      console.log("🧾 Produto recebido:", produtoAtualizado);
      console.log("🆔 ID recebido:", id);

      try {
        const produtoParaEnviar = {
          nome: produtoAtualizado.nome,
          descricao: produtoAtualizado.descricao,
          precoVenda: produtoAtualizado.precoVenda,
          estoqueMinimo: Number(produtoAtualizado.estoqueMinimo),
          categoriaId: produtoAtualizado.categoria?.id, // ⚠️ pode estar dando erro aqui
          urlImage: produtoAtualizado.urlImage,
          codigoBarras: produtoAtualizado.codigoBarras,
        };

        console.log("📦 Produto para enviar:", produtoParaEnviar);

        const { data } = await api.put<Produto>(
          `/produtos/${id}`,
          produtoParaEnviar
        );

        return data;
      } catch (error: any) {
        console.error("❌ Erro capturado no updateProduto:", error);

        if (isAxiosError(error)) {
          const mensagem =
            error.response?.data?.message || "Erro ao atualizar produto.";
          toast.error(mensagem);
          console.error("📨 Erro Axios:", mensagem);
        } else {
          toast.error("Erro inesperado. Tente novamente.");
          console.error("⚠️ Erro não Axios:", error);
        }

        return null;
      }
    },
    []
  );

  const deleteProduto = useCallback(async (id: string) => {
    try {
      await api.delete(`/produtos/delete/${id}`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produto removido!");
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      toast.error("Erro ao deletar produto");
    }
  }, []);

  const darBaixaEstoquePorVenda = useCallback(
    async (productId: string, quantity: number) => {
      try {
        await api.patch(`/estoque/movimentacao`, {
          productId,
          quantidade: quantity,
          tipo: "SAIDA",
          observacao: "Venda de produto",
        });
        toast.success(
          `Estoque atualizado com sucesso para o produto ${productId}!`
        );
        fetchProdutos(); // Refresh product list to reflect stock changes
      } catch (error) {
        console.error("Erro ao atualizar estoque:", error);
        toast.error("Erro ao atualizar estoque");
      }
    },
    [fetchProdutos]
  );

  const getEstoqueProdutoId = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/estoque/estoque-produto/${id}`);
      return response.data.estoque.estoqueTotal; // conforme o backend retorna { estoqueTotal }
    } catch (error: any) {
      console.error(
        "Erro ao buscar estoque do produto:",
        error.response?.data || error.message
      );
      // Retorna null ou 0 para evitar quebra do fluxo
      return 0;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProdutos();
    }
  }, [fetchProdutos, isAuthenticated]);

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
        darBaixaEstoquePorVenda,
        getEstoqueProdutoId,
        fetchMarcaProduto,
        createMarcaProduto,
      }}
    >
      {children}
    </ProdutoContext.Provider>
  );
};

export const useProdutos = () => useContext(ProdutoContext);
