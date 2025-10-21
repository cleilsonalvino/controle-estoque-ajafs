import { useEffect, useState } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle ,
  DollarSign,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import api from "@/lib/api";

interface ValorEstoqueResponse {
  valorEstoque: {
    total: number;
    quantidadeLotes: number;
    produtosDistintos: number;
  };
}

const Dashboard = () => {
  const { produtos, loading } = useProdutos();
  const { sales } = useSales();

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
        console.error("Erro ao buscar valor de estoque:", error);
      }
    };

    fetchValorEstoque();
  }, []);

  const lowStockProducts = produtos.filter(
    (p) =>
      Number(p.estoqueMinimo) > 0 &&
      p.lote?.[0]?.quantidadeAtual <= Number(p.estoqueMinimo)
  );

  if (loading) {
    return (
      <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-md" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Produtos Cadastrados",
      tooltip:
        "Número total de produtos registrados no sistema, incluindo aqueles sem estoque ativo.",
      value: produtos.length,
      description: "Produtos registrados",
      icon: Package,
      color: "bg-gradient-primary",
    },
    {
      title: "Valor Total em Estoque",
      tooltip:
        "Soma total (em reais) do valor de custo de todos os lotes ativos no estoque. Produtos distintos são contabilizados apenas uma vez.",
      value: valorEstoque.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      description: `${qtdLotes} lotes • ${produtosDistintos} produtos distintos`,
      icon: DollarSign,
      color: "bg-gradient-success",
    },
    {
      title: "Total de Vendas",
      tooltip:
        "Número de vendas registradas no sistema. Cada venda pode conter um ou mais produtos.",
      value: sales.length,
      description: "Vendas registradas",
      icon: TrendingUp,
      color: "bg-primary",
    },
    {
      title: "Alertas de Estoque",
      tooltip:
        "Produtos com quantidade atual igual ou inferior ao estoque mínimo definido.",
      value: lowStockProducts.length,
      description: "Abaixo do estoque mínimo",
      icon: AlertTriangle,
      color: lowStockProducts.length > 0 ? "bg-destructive" : "bg-muted",
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="p-6 space-y-10">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do estoque, lotes e desempenho de vendas
            </p>
          </div>
        </div>

        {/* Indicadores */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="relative overflow-hidden bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    {stat.title}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-sm leading-relaxed">
                        {stat.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </div>

                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>

                {stat.title === "Alertas de Estoque" && lowStockProducts.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {lowStockProducts.slice(0, 2).map((product) => (
                      <Badge key={product.id} variant="destructive" className="text-xs">
                        {product.nome} ({product.lote?.[0]?.quantidadeAtual ?? 0} unid.)
                      </Badge>
                    ))}
                    {lowStockProducts.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{lowStockProducts.length - 2} outros
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
