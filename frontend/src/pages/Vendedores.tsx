import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useVendedores, Vendedor } from "@/contexts/VendedorContext";
import { useSales } from "@/contexts/SalesContext";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import {
  FileDown, Loader2, Users, Trophy, DollarSign, Target, PlusCircle, Trash2, Edit,
  Calendar as CalendarIcon, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, differenceInDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Vendedores = () => {
  const { vendedores, createVendedor, updateVendedor, deleteVendedor, loading } = useVendedores();
  const { sales } = useSales();

  // Estados dos Modais e Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);
  const [formData, setFormData] = useState({ nome: "", email: "", meta: "" });
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Estados de Filtro e Paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [date, setDate] = useState<DateRange | undefined>();

  // === Lógica de Filtro de Data ===
  const numDaysInPeriod = useMemo(() => {
    if (date?.from && date.to) return differenceInDays(date.to, date.from) + 1;
    if (date?.from) return 1; // Se selecionar só um dia
    return 30.44; // Média de dias no mês
  }, [date]);
  const prorateFactor = numDaysInPeriod / 30.44;

  const filteredSales = useMemo(() => {
    if (!date?.from) return sales; // Retorna todas se não houver filtro
    const from = startOfDay(date.from);
    const to = date.to ? startOfDay(date.to) : from; // Se não houver 'to', filtra só o dia 'from'
    
    return sales.filter(s => {
      const saleDate = startOfDay(new Date(s.criadoEm));
      return saleDate >= from && saleDate <= to;
    });
  }, [sales, date]);

  // === Análise e Métricas com useMemo (agora baseadas em filteredSales) ===
  const vendasPorVendedor = useMemo(() => {
    return vendedores.map((v) => {
      const vendas = filteredSales.filter((s) => s.vendedor?.id === v.id);
      const total = vendas.reduce((acc, cur) => acc + Number(cur.total || 0), 0);
      const metaProrated = (v.meta || 0) * prorateFactor;
      const percentualMeta = metaProrated > 0 ? (total / metaProrated) * 100 : 0;
      return {
        id: v.id, nome: v.nome, email: v.email,
        totalVendas: vendas.length, totalValor: total,
        meta: metaProrated, // Meta agora é prorrateada
        percentualMeta,
      };
    });
  }, [vendedores, filteredSales, prorateFactor]);

  const topVendedor = useMemo(() => 
    vendasPorVendedor.reduce((max, v) => (v.totalValor > (max?.totalValor || 0) ? v : max), null as any),
    [vendasPorVendedor]
  );
  
  const totalValorVendido = useMemo(() => filteredSales.reduce((acc, s) => acc + Number(s.total || 0), 0), [filteredSales]);
  const metaGeral = useMemo(() => vendedores.reduce((acc, v) => acc + Number(v.meta || 0), 0) * prorateFactor, [vendedores, prorateFactor]);
  const percentualMetaGeral = metaGeral > 0 ? (totalValorVendido / metaGeral) * 100 : 0;

  // === Dados para Gráficos ===
  const lineChartData = useMemo(() => {
    const dailySales = filteredSales.reduce((acc, sale) => {
      const day = format(new Date(sale.criadoEm), "dd/MM");
      acc[day] = (acc[day] || 0) + Number(sale.total);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(dailySales).map(([dia, total]) => ({ dia, total })).reverse(); // Reverte para ordem cronológica
  }, [filteredSales]);

  const barChartData = useMemo(() => 
    vendasPorVendedor.map(v => ({ nome: v.nome, Meta: v.meta, Vendido: v.totalValor }))
  , [vendasPorVendedor]);

  // === Filtro e Paginação ===
  const filteredVendedores = useMemo(() => 
    vendasPorVendedor.filter((v) => v.nome.toLowerCase().includes(searchTerm.toLowerCase())),
    [vendasPorVendedor, searchTerm]
  );
  const paginatedVendedores = filteredVendedores.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredVendedores.length / perPage);

  // === Handlers para CRUD ===
  const handleOpenModal = (type: "create" | "edit" | "delete", vendedor?: Vendedor) => {
    setModalType(type);
    setSelectedVendedor(vendedor || null);
    if (type === 'create') setFormData({ nome: '', email: '', meta: '' });
    // Busca a meta original, não a prorrateada
    if (type === 'edit' && vendedor) {
      const originalVendedor = vendedores.find(v => v.id === vendedor.id);
      setFormData({ 
        nome: originalVendedor?.nome || '', 
        email: originalVendedor?.email || '', 
        meta: String(originalVendedor?.meta || 0) 
      });
    }
    setIsModalOpen(true);
  };
  
  // ... (handleFormSubmit, handleDelete, handleInputChange - sem alterações)
  const handleFormSubmit = async () => { /* ... */ };
  const handleDelete = async () => { /* ... */ };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

  // === Lógica de Exportação (agora usa dados filtrados) ===
  const exportExcel = () => {
    const dataToExport = filteredVendedores.map(v => ({
      'Vendedor': v.nome, 'Email': v.email, 'Nº Vendas': v.totalVendas,
      'Valor Vendido': v.totalValor, 'Meta (Prorateada)': v.meta, '% Meta': v.percentualMeta.toFixed(1)
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(XLSX.utils.book_new(), ws, "Vendedores");
    XLSX.writeFile(XLSX.utils.book_new(), "desempenho_vendedores.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Desempenho dos Vendedores", 14, 15);
    autoTable(doc, {
      head: [["Vendedor", "Nº Vendas", "Vendido (R$)", "Meta (R$)", "% Meta"]],
      body: filteredVendedores.map(v => [
        v.nome, v.totalVendas, formatCurrency(v.totalValor), formatCurrency(v.meta), v.percentualMeta.toFixed(1) + "%"
      ]),
      startY: 20,
    });
    doc.save("desempenho_vendedores.pdf");
  };
  
  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  if (vendedores.length === 0) {
    // ... (Empty state - sem alterações)
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Painel de Vendedores</h1>
        <div className="flex flex-wrap gap-2">
          {/* --- NOVO: Filtro de Data --- */}
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant={"outline"} className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (date.to ? `${format(date.from, "dd/MM/y", {locale: ptBR})} - ${format(date.to, "dd/MM/y", {locale: ptBR})}` : format(date.from, "dd/MM/y", {locale: ptBR})) : <span>Filtrar por período</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
               <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} locale={ptBR}/>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={exportExcel}><FileDown className="h-4 w-4 mr-2" /> Excel</Button>
          <Button variant="outline" onClick={exportPDF}><FileDown className="h-4 w-4 mr-2" /> PDF</Button>
          <Button onClick={() => handleOpenModal('create')} className="bg-gradient-primary text-primary-foreground"><PlusCircle className="h-4 w-4 mr-2" /> Adicionar Vendedor</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Vendido (Período)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalValorVendido)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Meta (Período)</CardTitle><Target className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(metaGeral)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">% Meta Atingida</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{percentualMetaGeral.toFixed(1)}%</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Top Vendedor (Período)</CardTitle><Trophy className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-xl font-bold truncate">{topVendedor?.nome || 'N/A'}</div></CardContent></Card>
      </div>

      {/* --- Gráficos --- */}
      <div className="grid md:grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1"><CardHeader><CardTitle>Participação nas Vendas</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vendasPorVendedor} dataKey="totalValor" nameKey="nome" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                  {vendasPorVendedor.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartTooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* --- GRÁFICO DE BARRAS ATUALIZADO --- */}
        <Card className="xl:col-span-1"><CardHeader><CardTitle>Metas vs. Vendido</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                <RechartTooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="Meta" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Vendido" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* --- NOVO GRÁFICO DE LINHA --- */}
        <Card className="xl:col-span-1"><CardHeader><CardTitle>Evolução das Vendas (Período)</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                <RechartTooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" name="Total Vendido" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- Tabela --- */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle>Equipe de Vendas</CardTitle><CardDescription>Desempenho individual no período selecionado.</CardDescription></div>
            <Input placeholder="Buscar vendedor..." className="w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Nº Vendas</TableHead>
              <TableHead>Ticket Médio</TableHead>
              <TableHead>Vendido (Período)</TableHead>
              <TableHead className="w-[250px]">Progresso da Meta (Período)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {paginatedVendedores.length > 0 ? paginatedVendedores.map((v) => {
                // BUGFIX: Encontra o vendedor original para passar ao modal
                const originalVendedor = vendedores.find(v_orig => v_orig.id === v.id);
                return (
                  <TableRow key={v.id}>
                    <TableCell><div className="font-medium">{v.nome}</div><div className="text-sm text-muted-foreground">{v.email}</div></TableCell>
                    <TableCell>{v.totalVendas}</TableCell>
                    <TableCell>{formatCurrency(v.totalVendas > 0 ? v.totalValor / v.totalVendas : 0)}</TableCell>
                    <TableCell>{formatCurrency(v.totalValor)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2"> {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
                        <Progress value={v.percentualMeta} className={v.percentualMeta >= 100 ? 'bg-green-500' : 'bg-blue-500'} />
                        <span className="text-sm font-medium">{v.percentualMeta.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal('edit', originalVendedor)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal('delete', originalVendedor)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Nenhum vendedor encontrado para os filtros aplicados.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Paginação --- */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} /></PaginationItem>
            {[...Array(totalPages).keys()].map(num => (
              <PaginationItem key={num}><PaginationLink href="#" isActive={page === num + 1} onClick={(e) => { e.preventDefault(); setPage(num + 1); }}>{num + 1}</PaginationLink></PaginationItem>
            ))}
            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* --- Modais --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          {modalType === 'delete' ? (
            <>
              <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle><DialogDescription>Tem certeza que deseja excluir o vendedor <strong>{selectedVendedor?.nome}</strong>? Esta ação não pode ser desfeita.</DialogDescription></DialogHeader>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button variant="destructive" onClick={handleDelete} disabled={isLoadingAction}>
                  {isLoadingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Excluir
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader><DialogTitle>{modalType === 'create' ? 'Novo Vendedor' : 'Editar Vendedor'}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label htmlFor="nome">Nome</Label><Input id="nome" value={formData.nome} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="meta">Meta Mensal (R$)</Label><Input id="meta" type="number" value={formData.meta} onChange={handleInputChange} /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleFormSubmit} disabled={isLoadingAction}>
                  {isLoadingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendedores;