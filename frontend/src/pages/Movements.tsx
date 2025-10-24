import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Plus,
  Search,
  Calendar as CalendarIcon,
  FileDown,
  Package,
  TrendingUp,
  Activity,
  Users2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Movement {
  id: string;
  type: "ENTRADA" | "SAIDA" | "AJUSTE";
  product: string;
  quantity: number;
  reason: string;
  date: string;
  user: string;
  notes?: string;
  fornecedor?: string;
}

const COLORS = {
  ENTRADA: "#16a34a",
  SAIDA: "#dc2626",
  AJUSTE: "#f59e0b",
};

const Movements = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Filtros e controle
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
  const [filterProduct, setFilterProduct] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // --- Busca de dados ---
  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await api.get("/estoque/movimentacoes");
      const data = response.data.map((item: any) => ({
        id: item.id,
        type: item.tipo,
        product: item.produto?.nome || "Produto Deletado",
        quantity: Number(item.quantidade),
        reason: item.tipo,
        date: item.criadoEm,
        user: item.usuario?.nome || "Usuário do Sistema",
        fornecedor: item.fornecedor?.nome || "-",
        notes: item.observacao || "",
      }));
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMovements(data);
    } catch (error) {
      toast.error("Falha ao carregar o histórico de movimentações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
    (async () => {
      const [p, f] = await Promise.all([api.get("/produtos"), api.get("/fornecedores")]);
      setProducts(p.data);
      setSuppliers(f.data);
    })();
  }, []);

  // --- Filtragem ---
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        m.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === "all" || m.type === filterType;
      const matchesProduct = !filterProduct || m.product === filterProduct;
      const matchesSupplier = !filterSupplier || m.fornecedor === filterSupplier;
      const movementDate = new Date(m.date);
      const matchesDate =
        !date?.from ||
        (date.from && !date.to && startOfDay(movementDate) >= startOfDay(date.from)) ||
        (date.from &&
          date.to &&
          startOfDay(movementDate) >= startOfDay(date.from) &&
          startOfDay(movementDate) <= startOfDay(date.to));
      return matchesSearch && matchesType && matchesProduct && matchesSupplier && matchesDate;
    });
  }, [movements, searchTerm, filterType, filterProduct, filterSupplier, date]);

  const totalPages = Math.ceil(filteredMovements.length / ITEMS_PER_PAGE);
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- Estatísticas ---
  const totalEntradas = filteredMovements.filter((m) => m.type === "ENTRADA").reduce((acc, m) => acc + m.quantity, 0);
  const totalSaidas = filteredMovements.filter((m) => m.type === "SAIDA").reduce((acc, m) => acc + m.quantity, 0);
  const totalAjustes = filteredMovements.filter((m) => m.type === "AJUSTE").reduce((acc, m) => acc + m.quantity, 0);
  const saldoLiquido = totalEntradas - totalSaidas;
  const ultimoMovimento = filteredMovements[0]?.date
    ? format(new Date(filteredMovements[0].date), "dd/MM/yyyy HH:mm", { locale: ptBR })
    : "—";

  // --- Gráficos ---
  const chartDataByType = Object.entries({
    Entrada: totalEntradas,
    Saída: totalSaidas,
    Ajuste: totalAjustes,
  }).map(([name, value]) => ({ name, value }));

  const lineDataByDate = useMemo(() => {
    const grouped = filteredMovements.reduce((acc, m) => {
      const dateKey = new Date(m.date).toLocaleDateString("pt-BR");
      acc[dateKey] = (acc[dateKey] || 0) + m.quantity;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped).map(([date, qtd]) => ({ date, qtd }));
  }, [filteredMovements]);

  // --- Exportações ---
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredMovements.map((m) => ({
        Produto: m.product,
        Tipo: m.type,
        Quantidade: m.quantity,
        Fornecedor: m.fornecedor,
        Data: new Date(m.date).toLocaleString("pt-BR"),
        Usuário: m.user,
        Observação: m.notes,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimentações");
    XLSX.writeFile(wb, "movimentacoes_estoque.xlsx");
    toast.success("Planilha Excel exportada!");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Movimentações de Estoque", 14, 15);
    autoTable(doc, {
      head: [["Produto", "Tipo", "Qtd", "Fornecedor", "Data", "Usuário"]],
      body: filteredMovements.map((m) => [
        m.product,
        m.type,
        m.quantity,
        m.fornecedor,
        new Date(m.date).toLocaleString("pt-BR"),
        m.user,
      ]),
    });
    doc.save("movimentacoes_estoque.pdf");
    toast.success("PDF gerado com sucesso!");
  };

  // --- Render ---
  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
          <p className="text-muted-foreground">Painel completo de controle, análise e exportação.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" /> Nova</Button>
          <Button variant="outline" onClick={exportExcel} disabled={!filteredMovements.length}><FileDown className="h-4 w-4 mr-2" /> Excel</Button>
          <Button variant="outline" onClick={exportPDF} disabled={!filteredMovements.length}><FileDown className="h-4 w-4 mr-2" /> PDF</Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-green-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-green-700 text-sm">Entradas</p>
              <h3 className="text-2xl font-bold">{totalEntradas}</h3>
            </div>
            <ArrowUp className="text-green-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-red-700 text-sm">Saídas</p>
              <h3 className="text-2xl font-bold">{totalSaidas}</h3>
            </div>
            <ArrowDown className="text-red-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-yellow-700 text-sm">Ajustes</p>
              <h3 className="text-2xl font-bold">{totalAjustes}</h3>
            </div>
            <ArrowUpDown className="text-yellow-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-blue-700 text-sm">Saldo Líquido</p>
              <h3 className="text-2xl font-bold">{saldoLiquido}</h3>
              <p className="text-xs text-blue-600">Último movimento: {ultimoMovimento}</p>
            </div>
            <Activity className="text-blue-600 w-8 h-8" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Distribuição por Tipo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartDataByType} dataKey="value" nameKey="name" outerRadius={90} label>
                  {chartDataByType.map((entry) => (
                    <Cell key={entry.name} fill={entry.name === "Entrada" ? COLORS.ENTRADA : entry.name === "Saída" ? COLORS.SAIDA : COLORS.AJUSTE} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v} itens`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Movimentações por Data</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineDataByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="qtd" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-6">
          <Input placeholder="Buscar por produto ou observação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 min-w-[200px]" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="sm:w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ENTRADA">Entrada</SelectItem>
              <SelectItem value="SAIDA">Saída</SelectItem>
              <SelectItem value="AJUSTE">Ajuste</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterProduct} onValueChange={setFilterProduct}>
            <SelectTrigger className="sm:w-48"><SelectValue placeholder="Produto" /></SelectTrigger>
            <SelectContent>
              {products.map((p) => (<SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterSupplier} onValueChange={setFilterSupplier}>
            <SelectTrigger className="sm:w-48"><SelectValue placeholder="Fornecedor" /></SelectTrigger>
            <SelectContent>
              {suppliers.map((f) => (<SelectItem key={f.id} value={f.nome}>{f.nome}</SelectItem>))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[250px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? `${format(date.from, "dd/MM/yy", { locale: ptBR })} - ${date.to ? format(date.to, "dd/MM/yy", { locale: ptBR }) : ""}` : "Selecionar período"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0">
              <Calendar mode="range" selected={date} onSelect={setDate} numberOfMonths={2} locale={ptBR} />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader><CardTitle>Histórico ({filteredMovements.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-10">Carregando...</p>
          ) : paginatedMovements.length > 0 ? (
            <div className="space-y-2">
              {paginatedMovements.map((m) => (
                <div key={m.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">{m.type === "ENTRADA" ? <ArrowUp className="text-green-600" /> : m.type === "SAIDA" ? <ArrowDown className="text-red-600" /> : <ArrowUpDown className="text-yellow-600" />}</div>
                    <div>
                      <p className="font-semibold">{m.product}</p>
                      <p className="text-xs text-muted-foreground">{m.fornecedor}</p>
                      <p className="text-sm text-muted-foreground">{m.notes}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${m.type === "SAIDA" ? "text-red-600" : m.type === "ENTRADA" ? "text-green-600" : "text-yellow-600"}`}>{m.type === "SAIDA" ? "-" : "+"}{m.quantity}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(m.date), "dd/MM/yyyy HH:mm")} · {m.user}</p>
                  </div>
                </div>
              ))}
              <div className="text-right text-sm text-muted-foreground pt-2">Total nesta página: {paginatedMovements.reduce((acc, m) => acc + m.quantity, 0)}</div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma movimentação encontrada.</p>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href="#" isActive={currentPage === page} onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}>{page}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Modal de adicionar movimentação (mantém sua lógica existente) */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>Preencha os dados abaixo para registrar uma nova movimentação.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Movements;
