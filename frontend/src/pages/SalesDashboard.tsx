
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
import { useEffect, useState } from 'react';

const SalesDashboard = () => {

  
  const { sales: allSales, loading, products } = useSales() as any;
  const [filteredSales, setFilteredSales] = useState([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined);
  const [customerFilter, setCustomerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const exportToPDF = () => {
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [['Número', 'Data', 'Cliente', 'Status', 'Valor']],
      body: filteredSales.map(sale => [sale.numero, new Date(sale.criadoEm).toLocaleDateString(), sale.cliente, sale.status, `R$ ${sale.total.toLocaleString('pt-BR')}`]),
    });
    doc.save('relatorio_vendas.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredSales.map(sale => ({
      Número: sale.numero,
      Data: new Date(sale.criadoEm).toLocaleDateString(),
      Cliente: sale.cliente,
      Status: sale.status,
      Valor: sale.total,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendas");
    XLSX.writeFile(wb, 'relatorio_vendas.xlsx');
  };

  useEffect(() => {
    let filtered = allSales;

    if (dateRange && dateRange.from && dateRange.to) { // @ts-ignore
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.criadoEm!);
        return saleDate >= dateRange.from && saleDate <= dateRange.to;
      });
    }

    if (customerFilter) {
      filtered = filtered.filter(sale => sale.cliente.toLowerCase().includes(customerFilter.toLowerCase())); // @ts-ignore
    }

    if (statusFilter) { // @ts-ignore
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    setFilteredSales(filtered);
  }, [allSales, dateRange, customerFilter, statusFilter]);

  const totalRevenue = allSales.reduce((acc, sale) => acc + sale.total, 0);
  const numberOfSales = allSales.length; // @ts-ignore
  const averageTicket = numberOfSales > 0 ? totalRevenue / numberOfSales : 0;
  const estimatedProfit = totalRevenue * 0.25; // Assuming a 25% profit margin
  const pendingSales = allSales.filter(sale => sale.status === 'Pendente').length; // @ts-ignore
  const cancelledSales = allSales.filter(sale => sale.status === 'Cancelada').length; // @ts-ignore

  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  const currentMonthSales = allSales.filter(sale => new Date(sale.criadoEm).getMonth() === currentMonth); // @ts-ignore
  const lastMonthSales = allSales.filter(sale => new Date(sale.criadoEm).getMonth() === lastMonth); // @ts-ignore

  const currentMonthRevenue = currentMonthSales.reduce((acc, sale) => acc + sale.total, 0);
  const lastMonthRevenue = lastMonthSales.reduce((acc, sale) => acc + sale.total, 0);

  const monthlyGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  const salesByDay = allSales.reduce((acc, sale) => {
    const day = new Date(sale.criadoEm).toLocaleDateString(); // @ts-ignore
    if (!acc[day]) {
      acc[day] = 0;
    }
    acc[day] += 1;
    return acc;
  }, {});

  const averageDailySales = Object.keys(salesByDay).length > 0 ? numberOfSales / Object.keys(salesByDay).length : 0;

  const topCustomerOfMonth = currentMonthSales.reduce((acc, sale) => { // @ts-ignore
    const existingCustomer = acc.find(item => item.name === sale.cliente);
    if (existingCustomer) {
      existingCustomer.value += sale.total;
    } else {
      acc.push({ name: sale.cliente, value: sale.total });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value)[0];

  const totalByPaymentType = allSales.reduce((acc, sale) => { // @ts-ignore
    if (!acc[sale.paymentMethod]) {
      acc[sale.paymentMethod] = 0;
    }
    acc[sale.paymentMethod] += sale.total;
    return acc;
  }, {});

  const salesByPeriod = allSales.reduce((acc, sale) => {
    const month = new Date(sale.criadoEm).toLocaleString('default', { month: 'short' }); // @ts-ignore
    const existingMonth = acc.find(item => item.name === month);
    if (existingMonth) {
      existingMonth.total += sale.total;
    } else {
      acc.push({ name: month, total: sale.total });
    }
    return acc;
  }, []);

  const topCustomers = allSales.reduce((acc, sale) => { // @ts-ignore
    const existingCustomer = acc.find(item => item.name === sale.cliente);
    if (existingCustomer) {
      existingCustomer.value += sale.total;
    } else {
      acc.push({ name: sale.cliente, value: sale.total });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 5);

  const paymentMethods = allSales.reduce((acc, sale) => { // @ts-ignore
    const existingMethod = acc.find(item => item.name === sale.paymentMethod);
    if (existingMethod) {
      existingMethod.value += 1;
    } else {
      acc.push({ name: sale.formaPagamento, value: 1 });
    }
    return acc;
  }, []);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const topProducts = allSales.flatMap(sale => sale.itens).reduce((acc, item) => { // @ts-ignore
    const product = products.find(p => p.id === item.produtoId);
    const productName = product ? product.nome : 'Produto Desconhecido';
    const existingProduct = acc.find(p => p.name === productName);
    if (existingProduct) {
      existingProduct.value += item.quantity;
    } else {
      acc.push({ name: productName, value: item.quantidade });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 5);
  // @ts-ignore
  const salespeople = allSales.reduce((acc, sale) => { // @ts-ignore
    const existingSalesperson = acc.find(item => item.name === sale.salesperson);
    if (existingSalesperson) {
      existingSalesperson.sales += 1;
      existingSalesperson.revenue += sale.total;
    } else {
      acc.push({ name: sale.salesperson, sales: 1, revenue: sale.total, goal: '0%' });
    }
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue);

  const detailedSales = allSales; // @ts-ignore

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard de Vendas</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent> 
            <div className="text-2xl font-bold">R$ {totalRevenue}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Número de Vendas</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{numberOfSales}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {averageTicket.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {estimatedProfit.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSales}</div>
            <p className="text-xs text-muted-foreground">2 new pending sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Canceladas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledSales}</div>
            <p className="text-xs text-muted-foreground">1 new cancelled sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Crescimento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyGrowth.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">+3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vendas Médias por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDailySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total por Tipo de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              em breve
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>



      {/* Detailed Sales Report */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório Detalhado de Vendas</CardTitle>
          <CardDescription>Filtre e exporte os dados de vendas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* <DatePickerWithRange /> */}
              <Input placeholder="Cliente" className="w-48" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} />
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
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.numero}</TableCell>
                  <TableCell>{new Date(sale.criadoEm).toLocaleDateString()}</TableCell>
                  <TableCell>{sale.cliente}</TableCell>
                  <TableCell>{sale.status}</TableCell>
                  <TableCell className="text-right">R$ {sale.total.toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {monthlyGrowth < 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Queda nas Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">As vendas diminuíram {monthlyGrowth.toFixed(2)}% em relação ao mês anterior.</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Cliente do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomerOfMonth && <p className="text-sm text-muted-foreground">O cliente que mais comprou foi o {topCustomerOfMonth.name}, com R$ {topCustomerOfMonth.value.toLocaleString('pt-BR')} em compras.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projeção de Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">A projeção de faturamento para o próximo mês é de R$ 140.000,00.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesDashboard;
