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
import { useEffect, useMemo, useState } from 'react';

// ========================
// Tipos
// ========================
type ItemVenda = {
  produtoId?: string;
  quantidade?: number | string;
  quantity?: number | string; // fallback
  valorUnitario?: number | string;
};

type Venda = {
  id: string;
  numero: string;
  clienteId?: string;
  cliente: {
    nome: string;
  };        // se existir no seu contexto     // se existir no seu contexto
  vendedorId?: string;
  salesperson?: string;        // se existir
  criadoEm: string;            // ISO
  desconto?: number | string;
  formaPagamento?: string;     // p.ex. "pix"
  status: 'Concluída' | 'Pendente' | 'Cancelada' | string;
  total: number | string;      // pode vir string
  itens?: ItemVenda[];
  lucroEstimado?: number | string;
  observacoes?: string | null;
};

type Produto = {
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

const getClienteDisplay = (s) =>
  s.cliente.nome ?? s.cliente.nome ?? 'Cliente não informado';

// ========================
// Componente
// ========================
const SalesDashboard = () => {
  const { sales: allSalesRaw, products: productsRaw } = useSales() as {
    sales: Venda[] | undefined;
    products?: Produto[];
  };

  const allSales = Array.isArray(allSalesRaw) ? allSalesRaw : [];
  const products = Array.isArray(productsRaw) ? productsRaw : [];

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
      // incluir o fim do dia
      to.setHours(23, 59, 59, 999);
      arr = arr.filter(s => {
        const d = new Date(s.criadoEm);
        return d >= from && d <= to;
      });
    }

    if (customerFilter.trim()) {
      const term = customerFilter.toLowerCase();
      arr = arr.filter(s =>
        getClienteDisplay(s.cliente.nome).toLowerCase().includes(term)
      );
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
  const estimatedProfit = totalRevenue * 0.25;

  const pendingSales = allSales.filter(s => s.status === 'Pendente').length;
  const cancelledSales = allSales.filter(s => s.status === 'Cancelada').length;

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const lastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const currentYear = now.getFullYear();
  const lastMonthYear =
    currentMonthIndex === 0 ? currentYear - 1 : currentYear;

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
    // ordenar por chave YYYY-MM
    return [...map.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
  }, [allSales]);

  const topCustomers = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of allSales) {
      const key = getClienteDisplay(s);
      map.set(key, (map.get(key) ?? 0) + toNumber(s.total));
    }
    const arr = [...map.entries()].map(([name, value]) => ({ name, total: value}));
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
      if (!Array.isArray(s.itens)) continue;
      for (const it of s.itens) {
        const qtd = toNumber(it.quantidade ?? it.quantity);
        const prod = products.find(p => p.id === it.produtoId);
        const name = prod?.nome ?? 'Produto Desconhecido';
        map.set(name, (map.get(name) ?? 0) + qtd);
      }
    }
    const arr = [...map.entries()].map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 5);
  }, [allSales, products]);

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
        getClienteDisplay(s.cliente.nome),
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
            <div className="text-2xl font-bold">{fmtBRL(estimatedProfit)}</div>
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
        <Card>
          <CardHeader><CardTitle>Vendas por Período</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top 5 Clientes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle>Formas de Pagamento</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {paymentMethods.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top 5 Produtos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
            {/* Se quiser, substitua por um cálculo real */}
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
