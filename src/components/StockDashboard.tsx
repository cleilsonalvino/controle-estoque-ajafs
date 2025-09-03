import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/pages/Index";

interface StockDashboardProps {
  products: Product[];
}

export const StockDashboard = ({ products }: StockDashboardProps) => {
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const totalValue = products.reduce((acc, p) => acc + (p.quantity * p.price), 0);
  const averageStock = totalProducts > 0 ? Math.round(products.reduce((acc, p) => acc + p.quantity, 0) / totalProducts) : 0;

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
      value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
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
        <Card key={stat.title} className="relative overflow-hidden bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300">
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
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
            {stat.title === "Alertas" && lowStockProducts.length > 0 && (
              <div className="mt-3 space-y-1">
                {lowStockProducts.slice(0, 2).map((product) => (
                  <Badge key={product.id} variant="destructive" className="text-xs">
                    {product.name} ({product.quantity} restantes)
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