import { useState, useMemo } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProdutos } from "@/contexts/ProdutoContext";

// ==============================
// Helpers — preço como string
// ==============================
const parsePrecoToNumber = (v: string | number) => {
  const s = String(v ?? "");
  // remove separadores de milhar, troca vírgula por ponto, remove qualquer char extra
  const n = Number(s.replace(/\./g, "").replace(/,/g, ".").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const formatBRL = (v: string | number) =>
  parsePrecoToNumber(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ==============================
// Tipo do Produto
// ==============================
export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: string; // <-- agora é string
  estoqueAtual: number;
  estoqueMinimo: number;
  categoria: {
    id: string;
    nome: string;
  };
  fornecedor: {
    id: string;
    nome: string;
  };
  image?: string;
}

// ==============================
// Componente de Indicadores
// ==============================
const StockDashboard = ({ products }: { products: Product[] }) => {
  const totalProducts = products?.length || 0;

  const lowStockProducts = useMemo(
    () => products?.filter((p) => p.estoqueAtual <= p.estoqueMinimo) ?? [],
    [products]
  );

  const totalValue = useMemo(
    () => products?.reduce((acc, p) => acc + p.estoqueAtual * parsePrecoToNumber(p.preco), 0) ?? 0,
    [products]
  );

  const averageStock = useMemo(() => {
    return totalProducts > 0
      ? Math.round(products.reduce((acc, p) => acc + p.estoqueAtual, 0) / totalProducts)
      : 0;
  }, [products, totalProducts]);

  const stats = [
    {
      title: "Total de Produtos",
      value: totalProducts.toString(),
      description: "Produtos cadastrados",
      icon: Package,
      color: "bg-gradient-primary",
    },
    {
      title: "Valor Total",
      value: `R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      description: "Valor total do estoque",
      icon: DollarSign,
      color: "bg-gradient-success",
    },
    {
      title: "Estoque Médio",
      value: averageStock.toString(),
      description: "Quantidade média por produto",
      icon: TrendingUp,
      color: "bg-primary",
    },
    {
      title: "Alertas",
      value: lowStockProducts.length.toString(),
      description: "Produtos com estoque baixo",
      icon: AlertTriangle,
      color: lowStockProducts.length > 0 ? "bg-destructive" : "bg-muted",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="relative overflow-hidden bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>

            {stat.title === "Alertas" && lowStockProducts.length > 0 && (
              <div className="mt-3 space-y-1">
                {lowStockProducts.slice(0, 2).map((product) => (
                  <Badge key={product.id} variant="destructive" className="text-xs">
                    {product.nome} ({product.estoqueAtual} unid.)
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
  );
};

// ==============================
// Componentes de Gráficos (Simulados)
// ==============================
const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-64">{children}</CardContent>
  </Card>
);

const StockTurnoverChart = () => (
  <ChartCard title="Giro de Estoque">
    <div className="flex items-center justify-center h-full text-muted-foreground">
      [Gráfico de Giro de Estoque - Placeholder]
    </div>
  </ChartCard>
);

const TemporalEvolutionChart = () => (
  <ChartCard title="Evolução Temporal do Valor Total">
    <div className="flex items-center justify-center h-full text-muted-foreground">
      [Gráfico de Linha da Evolução Temporal - Placeholder]
    </div>
  </ChartCard>
);

const StockByCategoryChart = () => (
  <ChartCard title="Distribuição de Estoque por Categoria">
    <div className="flex items-center justify-center h-full text-muted-foreground">
      [Gráfico de Pizza/Donut por Categoria - Placeholder]
    </div>
  </ChartCard>
);

const StockLevelChart = () => (
  <ChartCard title="Níveis de Estoque vs. Ponto de Reposição">
    <div className="flex items-center justify-center h-full text-muted-foreground">
      [Gráfico de Barras com linhas de referência - Placeholder]
    </div>
  </ChartCard>
);

const SupplierPerformanceChart = () => (
  <ChartCard title="Performance de Fornecedores">
    <div className="flex items-center justify-center h-full text-muted-foreground">
      [Gráfico de Barras por Fornecedor - Placeholder]
    </div>
  </ChartCard>
);

const MovementSpeedChart = () => (
  <ChartCard title="Itens de Alta e Baixa Rotação">
    <div className="flex items-center justify-center h-full text-muted-foreground">
      [Gráfico de Funil ou Barras - Placeholder]
    </div>
  </ChartCard>
);

// ==============================
// Componente Principal (Dashboard)
// ==============================
const Dashboard = () => {
  const { produtos, loading, createProduto } = useProdutos() as unknown as {
    produtos: Product[];
    loading: boolean;
    createProduto: (p: Product) => void;
  };
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Exemplo: função para adicionar produto recebendo um shape "externo"
  const handleAddProductFromDialog = (newProduct: {
    name: string;
    category: string;
    quantity: number;
    minStock: number;
    price: number; // vem número, mas vamos salvar string
  }) => {
    const productForContext: Product = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      nome: newProduct.name,
      descricao: "",
      preco: String(newProduct.price.toFixed(2)), // <-- salva como string
      estoqueAtual: newProduct.quantity,
      estoqueMinimo: newProduct.minStock,
      categoria: { id: "1", nome: newProduct.category },
      fornecedor: { id: "1", nome: "Fornecedor Padrão" },
    };

    createProduto(productForContext);
    setShowAddDialog(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-muted-foreground">
        Carregando dados do estoque...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu estoque</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-8">
        <StockDashboard products={produtos} />

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <StockTurnoverChart />
          <TemporalEvolutionChart />
          <StockByCategoryChart />
          <StockLevelChart />
          <SupplierPerformanceChart />
          <MovementSpeedChart />
        </div>
      </div>

      {/* TODO: seu modal de Adicionar Produto pode chamar handleAddProductFromDialog */}
      {showAddDialog && (
        <div className="fixed inset-0 grid place-items-center bg-black/40 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Novo Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Aqui você pode renderizar seu formulário (Dialog shadcn/ui) e, ao enviar, chamar
                <code className="px-1">handleAddProductFromDialog</code>.
              </p>
            </CardContent>
            <div className="flex justify-end gap-2 p-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => handleAddProductFromDialog({ name: "Exemplo", category: "Geral", quantity: 10, minStock: 2, price: 19.9 })}>
                Inserir Exemplo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
