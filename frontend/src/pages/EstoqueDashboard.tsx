import { useEffect, useMemo, useState } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Layers,
  Clock,
  BarChart3,
  PieChart as PieIcon,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useProdutos } from "@/contexts/ProdutoContext";
import { useSales } from "@/contexts/SalesContext";
import { api } from "@/lib/api";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Tooltip as RechartTooltip,
  Legend,
} from "recharts";

interface ValorEstoqueResponse {
  valorEstoque: {
    total: number;
    quantidadeLotes: number;
    produtosDistintos: number;
  };
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9"];

const EstoqueDashboard = () => {
  const { produtos, loading, fetchProdutos } = useProdutos();
  const { sales, fetchSales } = useSales();
  const location = useLocation();

  const [valorEstoque, setValorEstoque] = useState<number>(0);
  const [qtdLotes, setQtdLotes] = useState<number>(0);
  const [produtosDistintos, setProdutosDistintos] = useState<number>(0);

  useEffect(() => {
    const fetchValorEstoque = async () => {
      try {
        const { data } = await api.get<ValorEstoqueResponse>("/estoque/valor-estoque");
        setValorEstoque(data.valorEstoque.total);
        setQtdLotes(data.valorEstoque.quantidadeLotes);
        setProdutosDistintos(data.valorEstoque.produtosDistintos);
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    const fetchAll = async () => {
      await Promise.all([fetchProdutos(), fetchSales(), fetchValorEstoque()]);
    };

    fetchAll();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() => toast.info("Dados atualizados automaticamente"));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [location.pathname]);

  const lowStockProducts = produtos.filter(
    (p) =>
      Number(p.estoqueMinimo) > 0 &&
      p.lote?.[0]?.quantidadeAtual <= Number(p.estoqueMinimo)
  );

  const produtosSemGiro = useMemo(() => {
    const vendidosIds = new Set(
      sales.flatMap((v) => v.itens?.map((i) => i.produtoId))
    );
    return produtos.filter((p) => !vendidosIds.has(p.id));
  }, [produtos, sales]);

  const produtosPorCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    produtos.forEach((p) => {
      const categoria = p.categoria?.nome || "Sem categoria";
      const estoque =
        p.lote?.reduce((s, l) => s + Number(l.quantidadeAtual), 0) || 0;
      map[categoria] = (map[categoria] || 0) + estoque;
    });
    return Object.entries(map).map(([nome, qtd]) => ({ nome, qtd }));
  }, [produtos]);

  const curvaABC = useMemo(() => {
    const lista = produtos
      .map((p) => {
        const valor = p.lote?.reduce(
          (s, l) => s + Number(l.precoCusto) * Number(l.quantidadeAtual),
          0
        );
        return { nome: p.nome, valor: valor ?? 0 };
      })
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    return lista;
  }, [produtos]);

  const giroProdutos = useMemo(() => {
    return produtos.map((p) => {
      const vendasProduto = sales.flatMap((v) =>
        v.itens?.filter((i) => i.produtoId === p.id)
      );
      const qtdVendida = vendasProduto.reduce((s, i) => s + Number(i?.quantidade || 0), 0);
      const estoque =
        p.lote?.reduce((s, l) => s + Number(l.quantidadeAtual), 0) || 0;

      const giro = qtdVendida > 0 ? qtdVendida / (estoque || 1) : 0;

      return { nome: p.nome, giro };
    });
  }, [produtos, sales]);

  const stats = [
    {
      title: "Produtos Cadastrados",
      value: produtos.length,
      tooltip: "Quantidade total de produtos no sistema.",
      icon: Package,
      color: "bg-gradient-primary",
    },
    {
      title: "Valor Total em Estoque",
      value: valorEstoque.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      tooltip: "Valor total considerando o custo de todos os lotes.",
      icon: DollarSign,
      color: "bg-gradient-success",
    },
    {
      title: "Produtos Sem Giro",
      value: produtosSemGiro.length,
      tooltip: "Produtos que nunca foram vendidos.",
      icon: Layers,
      color: "bg-indigo-500",
    },
    {
      title: "Alertas de Estoque",
      value: lowStockProducts.length,
      tooltip: "Produtos abaixo do estoque mínimo.",
      icon: AlertTriangle,
      color: "bg-destructive",
    },
  ];

  if (loading)
    return (
      <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-md" />
        ))}
      </div>
    );

  return (
    <TooltipProvider delayDuration={100}>
      <div className="p-8 space-y-10">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Estoque</h1>
          <p className="text-muted-foreground">
            Análise completa do estoque, lotes, giros e desempenho.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  {stat.title}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>{stat.tooltip}</TooltipContent>
                  </Tooltip>
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Curva ABC */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Curva ABC — Produtos por Valor</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={curvaABC}>
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartTooltip />
                  <Bar dataKey="valor" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Giro */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Giro de Estoque por Produto</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={giroProdutos.slice(0, 10)}>
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartTooltip />
                  <Bar dataKey="giro" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Categorias */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={produtosPorCategoria} dataKey="qtd" nameKey="nome" outerRadius={90}>
                    {produtosPorCategoria.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Valor parado */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Valor Parado (Produtos Sem Giro)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={produtosSemGiro.map((p) => ({
                    nome: p.nome,
                    valor:
                      p.lote?.reduce(
                        (s, l) => s + Number(l.precoCusto) * Number(l.quantidadeAtual),
                        0
                      ) ?? 0,
                  }))}
                >
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartTooltip />
                  <Bar dataKey="valor" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Produtos críticos */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Produtos Críticos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum produto crítico.</p>
            ) : (
              lowStockProducts.map((p) => (
                <Badge key={p.id} variant="destructive" className="text-xs">
                  {p.nome} — {p.lote?.[0]?.quantidadeAtual} unid.
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default EstoqueDashboard;
