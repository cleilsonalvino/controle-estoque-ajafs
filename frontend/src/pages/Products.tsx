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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const formatNomeCurto = (nome: string, limite = 16) =>
  nome.length > limite ? nome.slice(0, limite) + "..." : nome;

const limitarPie = (
  data: { nome: string; valor: number; [key: string]: any }[],
  limite = 5
) => {
  if (!data.length) return [];

  const ordenado = [...data].sort((a, b) => b.valor - a.valor);

  if (ordenado.length <= limite) return ordenado;

  const top = ordenado.slice(0, limite - 1);
  const outrosValor = ordenado
    .slice(limite - 1)
    .reduce((acc, item) => acc + item.valor, 0);

  return [...top, { nome: "Outros", valor: outrosValor }];
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

  const produtosComEstoque = useMemo(
    () => produtos.filter((p) => p.lote && p.lote.length > 0),
    [produtos]
  );

  const totalProdutos = produtos.length;

  const totalEstoque = useMemo(() => {
    return produtosComEstoque.reduce((acc, p) => {
      const valor = p.lote?.reduce((sum, lote) => {
        const quantidade = Number(lote.quantidadeAtual) || 0;
        const custo = Number(lote.precoCusto) || 0;
        return sum + quantidade * custo;
      }, 0);
      return acc + (valor || 0);
    }, 0);
  }, [produtosComEstoque]);

  const { lucroTotalEstimado, percentualLucro } = useMemo(() => {
    let lucro = 0;
    let valorEstoque = 0;

    produtosComEstoque.forEach((p) => {
      const lotesAtivos = p.lote.filter(
        (l) => Number(l.quantidadeAtual) > 0
      );

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

      lucro += valorTotalVenda - valorTotalCusto;
      valorEstoque += valorTotalCusto;
    });

    const perc = valorEstoque > 0 ? (lucro / valorEstoque) * 100 : 0;

    return {
      lucroTotalEstimado: lucro,
      percentualLucro: perc,
    };
  }, [produtosComEstoque]);

  const produtosBaixoEstoque = useMemo(
    () =>
      produtos.filter((p) => {
        const quantidadeTotal =
          p.lote?.reduce(
            (acc, lote) => acc + Number(lote.quantidadeAtual || 0),
            0
          ) || 0;
        const minimo = Number(p.estoqueMinimo || 0);
        return minimo > 0 && quantidadeTotal <= minimo;
      }).length,
    [produtos]
  );

  const totalItensEstoque = useMemo(
    () =>
      produtosComEstoque.reduce((acc, p) => {
        const qtd =
          p.lote?.reduce(
            (sum, lote) => sum + Number(lote.quantidadeAtual || 0),
            0
          ) || 0;
        return acc + qtd;
      }, 0),
    [produtosComEstoque]
  );

  const categoriasAtivas = useMemo(
    () =>
      new Set(
        produtos
          .map((p) => p.categoria?.nome)
          .filter((nome): nome is string => Boolean(nome))
      ).size,
    [produtos]
  );

  const topProdutosValorEstoque = useMemo(() => {
    const lista = produtosComEstoque
      .map((p) => {
        const valorEstoque =
          p.lote?.reduce((sum, lote) => {
            const quantidade = Number(lote.quantidadeAtual) || 0;
            const custo = Number(lote.precoCusto) || 0;
            return sum + quantidade * custo;
          }, 0) || 0;

        return {
          nome: p.nome || "Sem nome",
          nomeCurto: formatNomeCurto(p.nome || "Sem nome"),
          valorEstoque,
        };
      })
      .filter((item) => item.valorEstoque > 0)
      .sort((a, b) => b.valorEstoque - a.valorEstoque)
      .slice(0, 5);

    if (!lista.length) {
      return [
        { nome: "Sem dados", nomeCurto: "Sem dados", valorEstoque: 0 },
      ];
    }

    return lista;
  }, [produtosComEstoque]);

  const margemPorProdutoData = useMemo(() => {
    const lista = produtosComEstoque
      .map((p) => {
        const lotesAtivos = p.lote.filter(
          (l) => Number(l.quantidadeAtual) > 0
        );

        if (!lotesAtivos.length) {
          return null;
        }

        const quantidadeTotal = lotesAtivos.reduce(
          (sum, lote) => sum + Number(lote.quantidadeAtual),
          0
        );

        const valorTotalCusto = lotesAtivos.reduce(
          (sum, lote) =>
            sum + Number(lote.precoCusto) * Number(lote.quantidadeAtual),
          0
        );

        const precoVenda = Number(p.precoVenda) || 0;
        if (precoVenda <= 0) return null;

        const custoMedio = valorTotalCusto / (quantidadeTotal || 1);
        const margem = precoVenda - custoMedio;
        const margemPerc = custoMedio > 0 ? (margem / custoMedio) * 100 : 0;

        return {
          nome: p.nome || "Sem nome",
          nomeCurto: formatNomeCurto(p.nome || "Sem nome"),
          margemPercentual: Number(margemPerc.toFixed(1)),
        };
      })
      .filter((item): item is { nome: string; nomeCurto: string; margemPercentual: number } => Boolean(item))
      .sort((a, b) => b.margemPercentual - a.margemPercentual)
      .slice(0, 5);

    if (!lista.length) {
      return [
        {
          nome: "Sem dados",
          nomeCurto: "Sem dados",
          margemPercentual: 0,
        },
      ];
    }

    return lista;
  }, [produtosComEstoque]);

  const categoriaValorEstoqueData = useMemo(() => {
    const mapa: Record<string, number> = {};

    produtos.forEach((p) => {
      const nomeCategoria = p.categoria?.nome || "Sem categoria";

      const valor =
        p.lote?.reduce((sum, lote) => {
          const quantidade = Number(lote.quantidadeAtual) || 0;
          const custo = Number(lote.precoCusto) || 0;
          return sum + quantidade * custo;
        }, 0) || 0;

      if (!mapa[nomeCategoria]) mapa[nomeCategoria] = 0;
      mapa[nomeCategoria] += valor;
    });

    const lista = Object.entries(mapa).map(([nome, valor]) => ({
      nome: nome || "Sem categoria",
      valor: valor || 0,
    }));

    const limitada = limitarPie(lista, 6);

    if (!limitada.length) {
      return [{ nome: "Sem dados", valor: 1 }];
    }

    return limitada;
  }, [produtos]);

  const safeCategoriaData = categoriaValorEstoqueData.map((item) => ({
    ...item,
    valorReal: item.valor,
    valor: item.valor > 0 ? item.valor : 1,
  }));

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
    subtitle,
    children,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => (
    <div className="relative">
      <Card className="shadow-md h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center justify-between gap-2">
            <span>{title}</span>
            {subtitle && (
              <span className="text-xs text-muted-foreground font-normal">
                {subtitle}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent
          className={`h-[260px] sm:h-[320px] lg:h-[340px] transition-all duration-300 ${
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
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Visao geral de produtos
          </h1>
          <p className="text-sm text-muted-foreground">
            Painel premium com indicadores, graficos e lista completa de
            produtos, categorias e lotes.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-none shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <p className="text-xs sm:text-sm text-blue-800">
              Total de produtos cadastrados
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-700">
              {totalProdutos}
            </h2>
            <p className="text-xs text-blue-700 mt-1">
              Distribuidos em {categoriasAtivas} categorias ativas
            </p>
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
              <p className="text-xs text-green-700 mt-1">
                Considerando custo medio por lote
              </p>
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
                <div>
                  <p className="text-xs sm:text-sm text-yellow-800">
                    Lucro potencial do estoque
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-700">
                    R{"$ "}
                    {lucroTotalEstimado.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </h2>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer mt-1" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs text-xs sm:text-sm leading-relaxed"
                  >
                    <p>
                      Lucro estimado considera a diferenca entre o custo do
                      estoque e o preco de venda cadastrado para cada produto.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <p className="text-xs sm:text-sm text-yellow-800 flex items-center mt-2 gap-1">
                Margem media {percentualLucro.toFixed(1)}%
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
              Produtos com estoque critico
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-red-700">
              {produtosBaixoEstoque}
            </h2>
            <p className="text-xs text-red-700 mt-1">
              Itens abaixo ou igual ao estoque minimo
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2">
          <ProtectedCard
            title="Top produtos por valor em estoque"
            subtitle="Ordenado do maior para o menor"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProdutosValorEstoque}>
                <XAxis
                  dataKey="nomeCurto"
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) =>
                    `R$ ${Number(value).toLocaleString("pt-BR", {
                      maximumFractionDigits: 0,
                    })}`
                  }
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <RechartTooltip
                  formatter={(valor: any) =>
                    `R$ ${Number(valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  }
                  labelFormatter={(_, payload) =>
                    payload && payload[0]?.payload?.nome
                      ? payload[0].payload.nome
                      : ""
                  }
                />
                <Bar dataKey="valorEstoque" name="Valor em estoque">
                  {topProdutosValorEstoque.map((_, index) => (
                    <Cell
                      key={`cell-top-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ProtectedCard>
        </div>

        <ProtectedCard
          title="Distribuicao do valor em estoque por categoria"
          subtitle="Proporcao do valor total"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeCategoriaData}
                dataKey="valor"
                nameKey="nome"
                outerRadius={90}
                label={({ name, payload }) =>
                  `${name}: R$ ${Number(
                    payload.valorReal
                  ).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
                }
              >
                {safeCategoriaData.map((_, index) => (
                  <Cell
                    key={`cell-cat-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartTooltip
                formatter={(valor: any, _, payload) => [
                  `R$ ${Number(valor).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`,
                  payload?.payload?.nome || "Categoria",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ProtectedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <ProtectedCard
          title="Produtos com melhor margem percentual"
          subtitle="Com base em custo medio e preco de venda"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={margemPorProdutoData}>
              <XAxis
                dataKey="nomeCurto"
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <RechartTooltip
                formatter={(valor: any) => `${Number(valor).toFixed(1)}%`}
                labelFormatter={(_, payload) =>
                  payload && payload[0]?.payload?.nome
                    ? payload[0].payload.nome
                    : ""
                }
              />
              <Bar dataKey="margemPercentual" name="Margem">
                {margemPorProdutoData.map((_, index) => (
                  <Cell
                    key={`cell-margem-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ProtectedCard>

        <Card className="shadow-md h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base font-semibold">
              Resumo rapido do estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] sm:h-[320px] lg:h-[340px] flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Quantidade total de itens em estoque
              </span>
              <span className="font-semibold">
                {totalItensEstoque.toLocaleString("pt-BR", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Categorias ativas
              </span>
              <span className="font-semibold">{categoriasAtivas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Produtos com lote cadastrado
              </span>
              <span className="font-semibold">
                {produtosComEstoque.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Proporcao de produtos com estoque critico
              </span>
              <span className="font-semibold">
                {totalProdutos > 0
                  ? `${(
                      (produtosBaixoEstoque / totalProdutos) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use estes indicadores para definir prioridades de compra, queima
              de estoque e revisao de precos.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold flex justify-between">
            Lista de produtos
            <span>Total de {produtos.length} produtos</span>
          </CardTitle>
          
        </CardHeader>
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
