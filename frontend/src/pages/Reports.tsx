import { BarChart3, TrendingUp, Package, AlertTriangle, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Reports = () => {
  const salesData = [
    { month: "Jan", value: 45000, products: 123 },
    { month: "Fev", value: 52000, products: 145 },
    { month: "Mar", value: 48000, products: 134 },
    { month: "Abr", value: 61000, products: 167 },
    { month: "Mai", value: 55000, products: 152 },
    { month: "Jun", value: 67000, products: 189 },
  ];

  const topProducts = [
    { name: "Smartphone Samsung Galaxy", sales: 45, revenue: 58499.55 },
    { name: "Notebook Dell Inspiron", sales: 23, revenue: 57499.77 },
    { name: "Cadeira Ergonômica", sales: 34, revenue: 30599.66 },
    { name: "Mesa de Escritório", sales: 18, revenue: 10799.82 },
    { name: "Teclado Mecânico", sales: 56, revenue: 16799.44 },
  ];

  const categoryData = [
    { name: "Eletrônicos", percentage: 65, value: 125000 },
    { name: "Móveis", percentage: 25, value: 48000 },
    { name: "Outros", percentage: 10, value: 19200 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
              <p className="text-muted-foreground">Análises e métricas do seu negócio</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="month">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* KPIs principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-card border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas do Mês
              </CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ 67.000</div>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produtos Vendidos
              </CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">189</div>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ticket Médio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ 354</div>
              <p className="text-xs text-warning flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estoque Baixo
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3</div>
              <p className="text-xs text-muted-foreground mt-1">
                Produtos precisam reposição
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de vendas e produtos mais vendidos */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-gradient-card border-0 shadow-md">
            <CardHeader>
              <CardTitle>Vendas nos Últimos 6 Meses</CardTitle>
              <CardDescription>Evolução mensal de vendas e produtos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.map((item, index) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium w-8">{item.month}</div>
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full" 
                            style={{ width: `${(item.value / 70000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">R$ {item.value.toLocaleString('pt-BR')}</div>
                      <div className="text-xs text-muted-foreground">{item.products} produtos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-md">
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>Ranking de produtos por volume de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="text-sm font-medium line-clamp-1">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.sales} vendas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análise por categoria */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
            <CardDescription>Distribuição de vendas entre categorias de produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoryData.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>R$ {category.value.toLocaleString('pt-BR')}</span>
                    <span>{category.percentage}% do total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;