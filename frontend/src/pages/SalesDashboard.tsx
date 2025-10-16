import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, AlertTriangle, TrendingUp, UserCheck } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { useSales } from "@/contexts/SalesContext";
import { useProdutos } from "@/contexts/ProdutoContext";
import { useCategories } from "@/contexts/CategoryContext";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from 'react';

// ========================
// Tipos
// ========================
type ItemVenda = {
  produtoId?: string;
  quantidade?: number | string;
  quantity?: number | string; 
  precoUnitario?: number | string;  // <-- usar este campo (é o da API)
};


type Venda = {
  id: string;
  numero: string;
  clienteId?: string;
  cliente?: { nome: string } | null; // opcional
  vendedorId?: string;
  salesperson?: string;
  criadoEm: string;            // ISO
  desconto?: number | string;
  formaPagamento?: string;     // ex.: "pix"
  status: 'Concluída' | 'Pendente' | 'Cancelada' | string;
  total: number | string;      // pode vir string
  itens?: ItemVenda[];
  lucroEstimado?: number | string;
  observacoes?: string | null;
};

type Produto = {
  id: string;
  nome: string;
  categoria?: { id: string; nome?: string };
};

type Categoria = {
  id: string;
  nome: string;
};

// ========================
// Utils
// ========================
const toNumber = (v: unknown) => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v.replace?.(',', '.') ?? v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const fmtBRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE', '#FF6B6B'];

// chave mês/ano para não misturar anos
const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (d: Date) =>
  d.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''); // jan, fev...

const getClienteDisplay = (s: Venda) =>
  s?.cliente?.nome ?? 'Cliente não informado';

// ========================
// Blocos auxiliares
// ========================
const SalesLast6Months = () => {
  const { sales: allSalesRaw } = useSales() as { sales?: Venda[] };
  const allSales = Array.isArray(allSalesRaw) ? allSalesRaw : [];

  const salesData = useMemo(() => {
    const today = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      return { key: monthKey(d), month: monthLabel(d), value: 0, products: 0 };
    }).reverse();

    const seed = last6Months.reduce<Record<string, { key: string; month: string; value: number; products: number }>>(
      (acc, m) => ({ ...acc, [m.key]: m }),
      {}
    );

    const salesByMonth = allSales.reduce((acc, sale) => {
      const saleDate = new Date(sale.criadoEm);
      const key = monthKey(saleDate);
      if (acc[key]) {
        acc[key].value += toNumber(sale.total);
        const itens = Array.isArray(sale.itens) ? sale.itens : [];
        acc[key].products += itens.reduce((sum, item) => sum + toNumber(item.quantidade), 0);
      }
      return acc;
    }, seed);

    return Object.values(salesByMonth);
  }, [allSales]);

  const maxValue = Math.max(...salesData.map(d => d.value), 70000);

  return (
    <Card className="bg-gradient-card border-0 shadow-md">
      <CardHeader>
        <CardTitle>Vendas nos Últimos 6 Meses</CardTitle>
        <CardDescription>Evolução mensal de vendas e produtos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {salesData.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium w-10 capitalize">{item.month}</div>
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-primary h-2 rounded-full"
                      style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{fmtBRL(item.value)}</div>
                <div className="text-xs text-muted-foreground">{item.products} produtos</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TopSellingProducts = () => {
  const { sales: allSalesRaw } = useSales() as { sales?: Venda[] };
  const { produtos: produtosRaw } = useProdutos() as { produtos: Produto[] };
  const allSales = Array.isArray(allSalesRaw) ? allSalesRaw : [];
  const produtos = Array.isArray(produtosRaw) ? produtosRaw : [];

  const topProducts = useMemo(() => {
    const quantities = new Map<string, number>(); // productId -> qty

    for (const sale of allSales) {
      const itens = Array.isArray(sale.itens) ? sale.itens : [];
      for (const item of itens) {
        const productId = item.produtoId;
        if (!productId) continue;
        const qty = toNumber(item.quantidade ?? item.quantity);
        quantities.set(productId, (quantities.get(productId) ?? 0) + qty);
      }
    }

    const sorted = [...quantities.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return sorted.map(([productId, sales]) => {
      const product = produtos.find(p => p.id === productId);
      // receita do produto
      const revenue = allSales.reduce((acc, sale) => {
        const itens = Array.isArray(sale.itens) ? sale.itens : [];
        for (const i of itens) {
          if (i.produtoId === productId) {
            acc += toNumber(i.quantidade ?? i.quantity) * toNumber(i.precoUnitario);
          }
        }
        return acc;
      }, 0);

      return {
        name: product?.nome ?? 'Produto Desconhecido',
        sales,
        revenue,
      };
    });
  }, [allSales, produtos]);

  return (
    <Card className="bg-gradient-card border-0 shadow-md">
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
        <CardDescription>Ranking de produtos por volume de vendas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={`${product.name}-${index}`} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                  {index + 1}
                </Badge>
                <div>
                  <div className="text-sm font-medium line-clamp-1">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.sales} produtos vendidos</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  {fmtBRL(product.revenue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SalesByCategory = () => {
  const { sales: allSalesRaw } = useSales() as { sales?: Venda[] };
  const { produtos: produtosRaw } = useProdutos() as { produtos: Produto[] };
  const { categories: categoriesRaw } = useCategories() as { categories: Categoria[] };
  const allSales = Array.isArray(allSalesRaw) ? allSalesRaw : [];
  const produtos = Array.isArray(produtosRaw) ? produtosRaw : [];
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];

  const categoryData = useMemo(() => {
    const byCat = new Map<string, number>(); // categoryId -> total R$

    for (const sale of allSales) {
      const itens = Array.isArray(sale.itens) ? sale.itens : [];
      for (const item of itens) {
        const p = produtos.find(prod => prod.id === item.produtoId);
        const catId = p?.categoria?.id;
        if (!catId) continue;
        const value = toNumber(item.quantidade ?? item.quantity) * toNumber(item.precoUnitario);
        byCat.set(catId, (byCat.get(catId) ?? 0) + value);
      }
    }

    const total = [...byCat.values()].reduce((sum, v) => sum + v, 0);

    return categories.map(cat => {
      const value = byCat.get(cat.id) ?? 0;
      const percentage = total > 0 ? (value / total) * 100 : 0;
      return {
        id: cat.id,
        name: cat.nome,
        value,
        percentage,
      };
    });
  }, [allSales, produtos, categories]);

  return (
    <Card className="bg-gradient-card border-0 shadow-md">
      <CardHeader>
        <CardTitle>Vendas por Categoria</CardTitle>
        <CardDescription>Distribuição de vendas entre categorias de produtos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categoryData.map((c) => (
            <div key={c.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-sm text-muted-foreground">{c.percentage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-primary h-2 rounded-full"
                  style={{ width: `${c.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{fmtBRL(c.value)}</span>
                <span>{c.percentage.toFixed(2)}% do total</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ========================
// Componente principal
// ========================
const SalesDashboard = () => {
  const { sales: allSalesRaw } = useSales() as { sales?: Venda[] };
  const { produtos, fetchProdutos } = useProdutos() as { produtos: Produto[]; fetchProdutos: () => void };
  const { categories, fetchCategories } = useCategories() as { categories: Categoria[]; fetchCategories: () => void };

  useEffect(() => {
    fetchProdutos?.();
    fetchCategories?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allSales = Array.isArray(allSalesRaw) ? allSalesRaw : [];

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>();
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // ========================
  // Dados derivados (memo)
  // ========================
  const filteredSales = useMemo(() => {
    let arr = allSales.slice();

    if (dateRange?.from && dateRange?.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999); // incluir fim do dia
      arr = arr.filter(s => {
        const d = new Date(s.criadoEm);
        return d >= from && d <= to;
      });
    }

    if (customerFilter.trim()) {
      const term = customerFilter.toLowerCase();
      arr = arr.filter(s => getClienteDisplay(s).toLowerCase().includes(term));
    }

    if (statusFilter && statusFilter !== 'todos') {
      arr = arr.filter(s => s.status === statusFilter);
    }

    return arr;
  }, [allSales, dateRange, customerFilter, statusFilter]);

  const totalRevenue = useMemo(
    () => allSales.reduce((acc, s) => acc + toNumber(s.total), 0),
    [allSales]
  );
  const numberOfSales = allSales.length;
  const averageTicket = numberOfSales > 0 ? totalRevenue / numberOfSales : 0;

  const pendingSales = allSales.filter(s => s.status === 'Pendente').length;
  const cancelledSales = allSales.filter(s => s.status === 'Cancelada').length;

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const lastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const currentYear = now.getFullYear();
  const lastMonthYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;

  const currentMonthSales = allSales.filter(s => {
    const d = new Date(s.criadoEm);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
  });
  const lastMonthSales = allSales.filter(s => {
    const d = new Date(s.criadoEm);
    return d.getMonth() === lastMonthIndex && d.getFullYear() === lastMonthYear;
  });

  const currentMonthRevenue = currentMonthSales.reduce((acc, s) => acc + toNumber(s.total), 0);
  const lastMonthRevenue = lastMonthSales.reduce((acc, s) => acc + toNumber(s.total), 0);
  const monthlyGrowth = lastMonthRevenue > 0
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  const averageDailySales = useMemo(() => {
    const byDay = allSales.reduce<Record<string, number>>((acc, s) => {
      const k = new Date(s.criadoEm).toLocaleDateString('pt-BR');
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
    const dias = Object.keys(byDay).length;
    return dias > 0 ? numberOfSales / dias : 0;
  }, [allSales, numberOfSales]);

  const topCustomerOfMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of currentMonthSales) {
      const key = getClienteDisplay(s);
      map.set(key, (map.get(key) ?? 0) + toNumber(s.total));
    }
    const arr = [...map.entries()].map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr[0];
  }, [currentMonthSales]);

  const salesByPeriod = useMemo(() => {
    const map = new Map<string, { key: string; name: string; total: number }>();
    for (const s of allSales) {
      const d = new Date(s.criadoEm);
      const k = monthKey(d); // 2025-10
      const label = `${monthLabel(d)} ${d.getFullYear()}`; // out 2025
      const cur = map.get(k) ?? { key: k, name: label, total: 0 };
      cur.total += toNumber(s.total);
      map.set(k, cur);
    }
    return [...map.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
  }, [allSales]);

  const topCustomers = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of allSales) {
      const key = getClienteDisplay(s);
      map.set(key, (map.get(key) ?? 0) + toNumber(s.total));
    }
    const arr = [...map.entries()].map(([name, total]) => ({ name, total }));
    arr.sort((a, b) => b.total - a.total);
    return arr.slice(0, 5);
  }, [allSales]);

  const paymentMethods = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of allSales) {
      const name = s.formaPagamento ?? 'não informado';
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [allSales]);

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of allSales) {
      const itens = Array.isArray(s.itens) ? s.itens : [];
      for (const it of itens) {
        const qtd = toNumber(it.quantidade ?? it.quantity);
        const prod = (produtos ?? []).find(p => p.id === it.produtoId);
        const name = prod?.nome ?? 'Produto Desconhecido';
        map.set(name, (map.get(name) ?? 0) + qtd);
      }
    }
    const arr = [...map.entries()].map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 5);
  }, [allSales, produtos]);

  // ========================
  // Exportações
  // ========================
  const exportToPDF = () => {
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [['Número', 'Data', 'Cliente', 'Status', 'Valor']],
      body: filteredSales.map((s) => [
        s.numero,
        new Date(s.criadoEm).toLocaleDateString('pt-BR'),
        getClienteDisplay(s),
        s.status,
        fmtBRL(toNumber(s.total)),
      ]),
      styles: { fontSize: 9 },
      theme: 'striped',
    });
    doc.save('relatorio_vendas.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredSales.map(s => ({
        Número: s.numero,
        Data: new Date(s.criadoEm).toLocaleDateString('pt-BR'),
        Cliente: getClienteDisplay(s),
        Status: s.status,
        Valor: toNumber(s.total),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    XLSX.writeFile(wb, 'relatorio_vendas.xlsx');
  };

  // ========================
  // Render
  // ========================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard de Vendas</h1>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtBRL(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {lastMonthRevenue > 0 ? `Δ vs mês passado: ${monthlyGrowth.toFixed(1)}%` : 'Sem base do mês anterior'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Número de Vendas</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfSales}</div>
            <p className="text-xs text-muted-foreground">
              Mês atual: {currentMonthSales.length} • Mês passado: {lastMonthSales.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtBRL(averageTicket)}</div>
            <p className="text-xs text-muted-foreground">Com base em {numberOfSales} vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtBRL(totalRevenue * 0.25)}</div>
            <p className="text-xs text-muted-foreground">Margem suposta de 25%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSales}</div>
            <p className="text-xs text-muted-foreground">Acompanhar conversão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Canceladas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledSales}</div>
            <p className="text-xs text-muted-foreground">Monitorar motivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Crescimento Mensal</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyGrowth.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Receita mês atual vs anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vendas Médias por Dia</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDailySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Média no período total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total por Tipo de Pagamento</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              {paymentMethods.map(m => (
                <div key={m.name} className="flex justify-between">
                  <span className="capitalize">{m.name}</span>
                  <span>{m.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mês atual</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtBRL(currentMonthRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Vendas: {currentMonthSales.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesLast6Months />
        <TopSellingProducts />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <SalesByCategory />
      </div>

      {/* Tabela detalhada e filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório Detalhado de Vendas</CardTitle>
          <CardDescription>Filtre e exporte os dados de vendas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Coloque aqui seu DatePicker e faça setDateRange({from, to}) */}
              <Input
                placeholder="Cliente"
                className="w-48"
                value={customerFilter}
                onChange={e => setCustomerFilter(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline" onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.numero}</TableCell>
                  <TableCell>{new Date(s.criadoEm).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{getClienteDisplay(s)}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell className="text-right">{fmtBRL(toNumber(s.total))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {monthlyGrowth < 0 && (
          <Card>
            <CardHeader><CardTitle>Queda nas Vendas</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As vendas diminuíram {monthlyGrowth.toFixed(2)}% em relação ao mês anterior.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Cliente do Mês</CardTitle></CardHeader>
          <CardContent>
            {topCustomerOfMonth ? (
              <p className="text-sm text-muted-foreground">
                {topCustomerOfMonth.name}: {fmtBRL(topCustomerOfMonth.value)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Ainda sem dados no mês.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Projeção de Faturamento</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A projeção de faturamento para o próximo mês é um placeholder. Ajuste para seu modelo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesDashboard;
