import React, { useEffect, useMemo, useState } from "react";
import { useProdutos, Produto } from "@/contexts/ProdutoContext";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Category as Categoria } from "@/contexts/CategoryContext";
import { Supplier as Fornecedor } from "@/contexts/SupplierContext";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/useAuth";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { getProductColumns } from "@/components/tables/product-columns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { ProdutoDetalhesDialog } from "@/components/products/ProdutoDetalhesDialog";
import { EditProdutoDialog } from "@/components/products/EditProdutoDialog";
import { CreateProdutoDialog } from "@/components/products/CreateProdutoDialog";

const fetchCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await api.get<Categoria[]>("/categorias");
    return response.data;
  } catch (error: any) {
    console.error("Falha ao buscar categorias:", error.message || error);
    return [];
  }
};

const fetchFornecedores = async (): Promise<Fornecedor[]> => {
  try {
    const response = await api.get<Fornecedor[]>("/fornecedores");
    return response.data;
  } catch (error: any) {
    console.error("Falha ao buscar fornecedores:", error.message || error);
    return [];
  }
};

export const Products: React.FC = () => {
  const { toast } = useToast();
  const {
    produtos,
    loading,
    createProduto,
    updateProduto,
    deleteProduto,
    fetchProdutos,
  } = useProdutos();
  const location = useLocation();

  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  const { user } = useAuth();
  const isAdmin =
    user?.papel === "ADMINISTRADOR" ||
    user?.papel === "SUPER_ADMIN" ||
    user?.telasPermitidas?.includes("ADMINISTRADOR");

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetchProdutos(),
        fetchCategorias().then(setCategorias),
        fetchFornecedores().then(setFornecedores),
      ]);
    };

    fetchAll();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() => {
          sonnerToast.info("Dados atualizados automaticamente");
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname, fetchProdutos]);

  const totalProdutos = produtos.length;

  const produtosComEstoque = produtos.filter(
    (p) => p.lote && p.lote.length > 0
  );

  const totalEstoque = produtosComEstoque.reduce((acc, p) => {
    const qtdTotal = p.lote.reduce(
      (sum, lote) => sum + Number(lote.quantidadeAtual),
      0
    );

    const precoMedio =
      p.lote.reduce((sum, lote) => sum + Number(lote.precoCusto), 0) /
      (p.lote.length || 1);

    return acc + qtdTotal * precoMedio;
  }, 0);

  const lucroTotalEstimado = produtosComEstoque.reduce((acc, p) => {
    const lotesAtivos = p.lote.filter((l) => Number(l.quantidadeAtual) > 0);

    const quantidadeTotal = lotesAtivos.reduce(
      (sum, lote) => sum + Number(lote.quantidadeAtual),
      0
    );

    const valorTotalCusto = lotesAtivos.reduce(
      (sum, lote) =>
        sum + Number(lote.precoCusto) * Number(lote.quantidadeAtual),
      0
    );

    const valorTotalVenda = quantidadeTotal * (Number(p.precoVenda) || 0);

    return acc + (valorTotalVenda - valorTotalCusto);
  }, 0);

  const percentualLucro =
    totalEstoque > 0 ? (lucroTotalEstimado / totalEstoque) * 100 : 0;

  const produtosBaixoEstoque = produtos.filter(
    (p) =>
      p.lote?.reduce((acc, lote) => acc + Number(lote.quantidadeAtual), 0) <=
      Number(p.estoqueMinimo || 0)
  ).length;

  const topProdutosEstoque = produtosComEstoque
    .map((p) => ({
      nome: p.nome || "Sem nome",
      estoque:
        p.lote?.reduce(
          (sum, lote) => sum + Number(lote.quantidadeAtual || 0),
          0
        ) || 0,
    }))
    .sort((a, b) => b.estoque - a.estoque)
    .slice(0, 5);

  const custoVendaData = produtosComEstoque.map((p) => {
    const totalCusto =
      p.lote?.reduce((sum, lote) => sum + Number(lote.precoCusto || 0), 0) ||
      0;

    const quantidadeLotes = p.lote?.length || 1;

    const custo = totalCusto / quantidadeLotes;

    return {
      nome: p.nome || "Sem nome",
      custo: Number(custo) || 0,
      venda: Number(p.precoVenda) || 0,
    };
  });

  const categoriaMap: Record<string, number> = {};
  produtos.forEach((p) => {
    const categoriaNome = p.categoria?.nome || "Sem categoria";
    if (!categoriaMap[categoriaNome]) categoriaMap[categoriaNome] = 0;
    const qtd =
      p.lote?.reduce(
        (sum, lote) => sum + Number(lote.quantidadeAtual || 0),
        0
      ) || 0;
    categoriaMap[categoriaNome] += qtd;
  });

  const categoriaData = Object.entries(categoriaMap).map(
    ([nome, valor]) => ({
      nome: nome || "Sem categoria",
      valor: Number(valor) || 0,
    })
  );

  const safeTopProdutosEstoque = topProdutosEstoque?.length
    ? topProdutosEstoque
    : [{ nome: "Sem dados", estoque: 0 }];

  const safeCustoVendaData = custoVendaData?.length
    ? custoVendaData
    : [{ nome: "Sem dados", custo: 0, venda: 0 }];

  const safeCategoriaData = categoriaData?.length
    ? categoriaData.map((item) => ({
        nome: item.nome || "Sem categoria",
        valor: item.valor > 0 ? item.valor : 1,
        valorReal: item.valor || 0,
      }))
    : [{ nome: "Sem dados", valor: 1, valorReal: 0 }];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const handleOpenEdit = (produto: Produto) => {
    setSelectedProduct(produto);
    setOpenEdit(true);
  };

  const handleSave = async (produtoAtualizado: Produto) => {
    try {
      const { id, ...dados } = produtoAtualizado;
      await updateProduto(id, dados);
    } catch (error) {
      toast({
        title: "Erro ao atualizar produto",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const handleCreate = async (novoProduto: Omit<Produto, "id">) => {
    try {
      const response = await createProduto(novoProduto);
      if (response) {
        toast({ title: "Produto criado com sucesso." });
        setOpenCreate(false);
        fetchProdutos();
      }
    } catch (error) {
      toast({
        title: "Erro ao criar produto",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduto(id);
      toast({ title: "Produto removido com sucesso." });
    } catch (error) {
      toast({
        title: "Erro ao remover produto",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const handleOpenDetalhes = (produto: Produto) => {
    setSelectedProduct(produto);
    setOpenDetalhes(true);
  };

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: handleOpenEdit,
        onDelete: handleDelete,
        onView: handleOpenDetalhes,
      }),
    [produtos]
  );

  const ProtectedCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="relative">
      <Card className="shadow-md h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg font-semibold">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent
          className={`h-64 sm:h-72 lg:h-80 transition-all duration-300 ${
            isAdmin ? "" : "blur-sm pointer-events-none select-none"
          }`}
        >
          {children}
        </CardContent>
      </Card>

      {!isAdmin && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
          <span className="text-xs sm:text-sm text-gray-700 font-medium flex items-center gap-1 text-center px-4">
            Acesso restrito a administradores
          </span>
        </div>
      )}
    </div>
  );

  if (loading && produtos.length === 0) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-none shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <p className="text-xs sm:text-sm text-blue-800">
              Total de produtos
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-700">
              {totalProdutos}
            </h2>
          </CardContent>
        </Card>

        <div className="relative">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-none shadow-sm h-full">
            <CardContent
              className={`p-4 flex flex-col gap-1 transition-all duration-300 ${
                isAdmin ? "" : "blur-sm pointer-events-none select-none"
              }`}
            >
              <p className="text-xs sm:text-sm text-green-800">
                Valor total em estoque
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-green-700">
                R{"$ "}
                {totalEstoque.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </h2>
            </CardContent>
          </Card>

          {!isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
              <span className="text-xs sm:text-sm text-gray-700 font-medium text-center px-4">
                Acesso restrito a administradores
              </span>
            </div>
          )}
        </div>

        <div className="relative">
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-none shadow-sm h-full">
            <CardContent
              className={`p-4 flex flex-col gap-1 transition-all duration-300 ${
                isAdmin ? "" : "blur-sm pointer-events-none select-none"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-700">
                  R{"$ "}
                  {lucroTotalEstimado.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h2>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer mt-1" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs text-xs sm:text-sm leading-relaxed"
                  >
                    <p>
                      Lucro estimado é a diferença entre o preço de venda e o
                      custo dos itens em estoque. Representa o potencial de
                      ganho se todo o estoque for vendido pelo preço atual.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <p className="text-xs sm:text-sm text-yellow-800 flex items-center mt-2 gap-1">
                Lucro estimado {percentualLucro.toFixed(1)} %
                {lucroTotalEstimado > 0 ? (
                  <TrendingUp className="text-green-400 w-5 h-5" />
                ) : (
                  <TrendingDown className="text-red-400 w-5 h-5" />
                )}
              </p>
            </CardContent>
          </Card>

          {!isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
              <span className="text-xs sm:text-sm text-gray-700 font-medium flex items-center gap-1 text-center px-4">
                Acesso restrito a administradores
              </span>
            </div>
          )}
        </div>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-none shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <p className="text-xs sm:text-sm text-red-800">
              Produtos com estoque baixo
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-red-700">
              {produtosBaixoEstoque}
            </h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        <ProtectedCard title="Top produtos em estoque">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeTopProdutosEstoque}>
              <XAxis dataKey="nome" hide={false} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartTooltip />
              <Bar dataKey="estoque" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ProtectedCard>

        <ProtectedCard title="Relação custo x venda">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeCustoVendaData}>
              <XAxis dataKey="nome" hide={false} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <RechartTooltip />
              <Bar dataKey="custo" fill="#F87171" name="Custo" />
              <Bar dataKey="venda" fill="#10B981" name="Venda" />
            </BarChart>
          </ResponsiveContainer>
        </ProtectedCard>

        <ProtectedCard title="Distribuição por categoria">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeCategoriaData}
                dataKey="valor"
                nameKey="nome"
                outerRadius={80}
                label={({ name, payload }) =>
                  `${name}: ${payload.valorReal}`
                }
              >
                {safeCategoriaData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartTooltip />
            </PieChart>
          </ResponsiveContainer>
        </ProtectedCard>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Produtos
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestão de produtos, fornecedores e lotes de forma inteligente.
          </p>
        </div>
        <Button
          onClick={() => setOpenCreate(true)}
          className="h-10 gap-2 self-stretch sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar produto
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-2 sm:p-4">
          <div className="w-full overflow-x-auto">
            <DataTable columns={columns} data={produtos} />
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <EditProdutoDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          produto={selectedProduct}
          onSave={handleSave}
          categorias={categorias}
          fornecedores={fornecedores}
        />
      )}

      <CreateProdutoDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreate={handleCreate}
        categorias={categorias}
        fornecedores={fornecedores}
      />

      {selectedProduct && (
        <ProdutoDetalhesDialog
          open={openDetalhes}
          onOpenChange={setOpenDetalhes}
          produto={selectedProduct}
        />
      )}
    </div>
  );
};

export default Products;
