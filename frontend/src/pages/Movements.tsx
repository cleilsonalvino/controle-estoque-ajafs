import AddSupplierModal from "@/components/AddSupplierModal";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Calendar as CalendarIcon,
  FileDown,
  Activity,
  FilterX,
  Info,
  CirclePlus,
  ChevronsUpDown,
  Check,
  History,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  Cell,
} from "recharts";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Produto } from "@/contexts/ProdutoContext";
import { useSuppliers } from "@/contexts/SupplierContext";

interface Movement {
  id: string;
  type: "ENTRADA" | "SAIDA" | "AJUSTE";
  product: string;
  quantity: number;
  reason: string;
  date: string;
  usuario: {
    id: string;
    nome: string;
  };
  notes?: string | null;
  fornecedor?: string;
  precoCusto?: number;
  validade?: string;
}

const COLORS = {
  ENTRADA: "#16a34a",
  SAIDA: "#dc2626",
  AJUSTE: "#f59e0b",
};

const initialFormState = {
  tipo: "ENTRADA",
  produtoId: "",
  fornecedorId: "",
  quantidade: "",
  observacao: "",
  precoCusto: "",
  validade: "",
};

const Movements = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [form, setForm] = useState(initialFormState);

  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [products, setProducts] = useState<Produto[]>([]);
  const { suppliers, fetchSuppliers } = useSuppliers();

  const location = useLocation();

  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);

      await fetchSuppliers();

      const [movementsResponse, productsResponse] = await Promise.all([
        api.get("/estoque/movimentacoes"),
        api.get("/produtos"),
      ]);

      const movementsData: Movement[] = movementsResponse.data
        .map((item: any) => ({
          id: item.id,
          type: item.tipo,
          product: item.produto?.nome || "Produto Deletado",
          quantity: Number(item.quantidade),
          reason: item.tipo,
          date: item.criadoEm,
          usuario: item.usuario
            ? { id: item.usuario.id, nome: item.usuario.nome }
            : { id: "", nome: "Usuário do Sistema" },
          fornecedor: item.fornecedor?.nome || "-",
          notes: item.observacao || null,
          precoCusto: item.precoCusto ? Number(item.precoCusto) : undefined,
          validade: item.validade,
        }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setMovements(movementsData);
      setProducts(productsResponse.data);
    } catch (error) {
      toast.error("Falha ao carregar dados da página.");
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierCreated = () => {
    fetchSuppliers();
    setShowAddSupplierModal(false);
    toast.success("Fornecedor criado e lista atualizada.");
  };

  useEffect(() => {
    fetchAll();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() => toast.info("Dados atualizados automaticamente."));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname, fetchSuppliers]);

  // sempre volta para a página 1 ao mudar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, date]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        m.product.toLowerCase().includes(searchTermLower) ||
        (m.notes && m.notes.toLowerCase().includes(searchTermLower)) ||
        (m.usuario &&
          m.usuario.nome.toLowerCase().includes(searchTermLower));

      const matchesType = filterType === "all" || m.type === filterType;

      const movementDate = new Date(m.date);
      const matchesDate =
        !date?.from ||
        (date.from &&
          !date.to &&
          startOfDay(movementDate) >= startOfDay(date.from)) ||
        (date.from &&
          date.to &&
          startOfDay(movementDate) >= startOfDay(date.from) &&
          startOfDay(movementDate) <= startOfDay(date.to));

      return matchesSearch && matchesType && matchesDate;
    });
  }, [movements, searchTerm, filterType, date]);

  const filteredModalProducts = useMemo(() => {
    if (!productSearchTerm) return products;
    const termo = productSearchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        (p.codigoBarras && p.codigoBarras.includes(productSearchTerm))
    );
  }, [products, productSearchTerm]);

  const totalPages = Math.ceil(filteredMovements.length / ITEMS_PER_PAGE);
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalEntradas = useMemo(
    () =>
      filteredMovements
        .filter((m) => m.type === "ENTRADA")
        .reduce((acc, m) => acc + m.quantity, 0),
    [filteredMovements]
  );

  const totalSaidas = useMemo(
    () =>
      filteredMovements
        .filter((m) => m.type === "SAIDA")
        .reduce((acc, m) => acc + m.quantity, 0),
    [filteredMovements]
  );

  const totalAjustes = useMemo(
    () =>
      filteredMovements
        .filter((m) => m.type === "AJUSTE")
        .reduce((acc, m) => acc + m.quantity, 0),
    [filteredMovements]
  );

  const saldoLiquido = useMemo(
    () => totalEntradas - totalSaidas,
    [totalEntradas, totalSaidas]
  );

  const totalMovimentacoes = useMemo(
    () => filteredMovements.length,
    [filteredMovements]
  );

  const chartDataByType = useMemo(
    () =>
      Object.entries({
        Entrada: totalEntradas,
        Saída: totalSaidas,
        Ajuste: totalAjustes,
      }).map(([name, value]) => ({ name, value })),
    [totalEntradas, totalSaidas, totalAjustes]
  );

  const topProductsData = useMemo(() => {
    const productCount = filteredMovements.reduce((acc, m) => {
      acc[m.product] = (acc[m.product] || 0) + m.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [filteredMovements]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setDate(undefined);
    setCurrentPage(1);
    toast.info("Filtros limpos.");
  };

  const handleSaveMovement = async () => {
    if (!form.produtoId || !form.quantidade || !form.tipo) {
      toast.error("Preencha tipo, produto e quantidade.");
      return;
    }
    if (form.tipo === "ENTRADA" && (!form.fornecedorId || !form.precoCusto)) {
      toast.error(
        "Para entradas, fornecedor e preço de custo são obrigatórios."
      );
      return;
    }

    const { id } = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      const payload = {
        produtoId: form.produtoId,
        tipo: form.tipo,
        quantidade: Number(form.quantidade),
        observacao: form.observacao || null,
        fornecedorId: form.tipo === "ENTRADA" ? form.fornecedorId : null,
        precoCusto:
          form.tipo === "ENTRADA"
            ? form.precoCusto?.replace(/\./g, "").replace(",", ".")
            : null,
        validade: form.tipo === "ENTRADA" ? form.validade || null : null,
        usuarioId: id,
      };

      await api.post("/estoque/movimentacao", payload);

      toast.success("Movimentação registrada com sucesso.");
      setShowAddDialog(false);
      setForm(initialFormState);
      fetchAll();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Erro ao salvar movimentação.";
      toast.error(errorMsg);
    }
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
        m.usuario?.nome ?? "Usuário do Sistema",
      ]),
    });
    doc.save("movimentacoes_estoque.pdf");
    toast.success("PDF gerado com sucesso.");
  };

  const handlePriceInput = (value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits === "") digits = "0";
    const numericValue = (parseInt(digits, 10) / 100).toFixed(2);
    const formatted = numericValue
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setForm((prev) => ({ ...prev, precoCusto: formatted }));
  };

  const handleSetLastCostPrice = (productId: string) => {
    if (!productId) return;

    const selectedProduct = products.find((p) => p.id === productId);
    if (!selectedProduct) return;

    const sortedLotes = selectedProduct.lote
      ?.filter((l) => l.precoCusto != null)
      .sort(
        (a, b) =>
          new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );

    const lastLote = sortedLotes?.[0];

    if (lastLote) {
      const lastPrice = Number(lastLote.precoCusto)
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      toast.info(`Preço de custo anterior R$ ${lastPrice} preenchido.`);
      setForm((prev) => ({ ...prev, precoCusto: lastPrice }));
    } else {
      toast.info(
        "Nenhum preço de custo anterior encontrado para este produto."
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="relative min-h-svh flex flex-col p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white">
        {/* cabeçalho e ações */}
        <div className="flex justify-between flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Movimentações de Estoque
            </h1>
            <p className="text-sm text-muted-foreground">
              Painel completo de controle, análise e exportação de entradas, saídas e ajustes.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Nova movimentação
            </Button>
            <Button
              variant="outline"
              onClick={exportPDF}
              disabled={!filteredMovements.length}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" /> Exportar PDF
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">
                Entradas
              </CardTitle>
              <ArrowUp className="h-4 w-4 text-emerald-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">
                {totalEntradas}
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Itens adicionados no período filtrado.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-rose-50 to-rose-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-rose-800">
                Saídas
              </CardTitle>
              <ArrowDown className="h-4 w-4 text-rose-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-900">
                {totalSaidas}
              </div>
              <p className="text-xs text-rose-800 mt-1">
                Itens removidos por venda ou perda.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800 flex items-center gap-1">
                Saldo líquido
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-indigo-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-sm">
                    Diferença entre entradas e saídas no período filtrado.
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Activity className="h-4 w-4 text-indigo-700" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  saldoLiquido >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {saldoLiquido}
              </div>
              <p className="text-xs text-indigo-800 mt-1">
                Bom para acompanhar a tendência de estoque.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-amber-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">
                Ajustes
              </CardTitle>
              <ArrowUpDown className="h-4 w-4 text-amber-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {totalAjustes}
              </div>
              <p className="text-xs text-amber-800 mt-1">
                Movimentos de inventário e correções.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-slate-100 hidden xl:block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-800">
                Movimentações
              </CardTitle>
              <History className="h-4 w-4 text-slate-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalMovimentacoes}
              </div>
              <p className="text-xs text-slate-700 mt-1">
                Registros encontrados com os filtros atuais.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* gráficos */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Distribuição por tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartDataByType}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {chartDataByType.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.name === "Entrada"
                            ? COLORS.ENTRADA
                            : entry.name === "Saída"
                            ? COLORS.SAIDA
                            : COLORS.AJUSTE
                        }
                      />
                    ))}
                  </Pie>
                  <RechartTooltip
                    formatter={(value: number) => `${value} itens`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Produtos mais movimentados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={topProductsData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={140}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartTooltip />
                  <Bar dataKey="value" name="Quantidade" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* filtros */}
        <Card className="shadow-sm">
          <CardContent className="flex flex-wrap gap-4 pt-6 items-end">
            <Input
              placeholder="Buscar por produto, usuário ou observação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ENTRADA">Entrada</SelectItem>
                <SelectItem value="SAIDA">Saída</SelectItem>
                <SelectItem value="AJUSTE">Ajuste</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from
                    ? date.to
                      ? `${format(date.from, "dd/MM/yy")} a ${format(
                          date.to,
                          "dd/MM/yy"
                        )}`
                      : format(date.from, "dd/MM/yy")
                    : "Período"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="text-muted-foreground"
            >
              <FilterX className="h-4 w-4 mr-2" /> Limpar
            </Button>
          </CardContent>
        </Card>

        {/* histórico */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Histórico de movimentações ({filteredMovements.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-10 text-muted-foreground">
                Carregando...
              </p>
            ) : paginatedMovements.length > 0 ? (
              <div className="space-y-2">
                {paginatedMovements.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-slate-100">
                        {m.type === "ENTRADA" ? (
                          <ArrowUp className="text-emerald-600" />
                        ) : m.type === "SAIDA" ? (
                          <ArrowDown className="text-rose-600" />
                        ) : (
                          <ArrowUpDown className="text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">
                          {m.product}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {m.notes || "Sem observação."}
                        </p>
                        {m.fornecedor && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Fornecedor: {m.fornecedor}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <p
                        className={`font-bold text-lg ${
                          m.type === "SAIDA"
                            ? "text-rose-600"
                            : m.type === "ENTRADA"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {m.type === "SAIDA" ? "-" : "+"} {m.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(m.date), "dd/MM/yy HH:mm")} ·{" "}
                        {m.usuario?.nome ?? "Usuário do Sistema"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma movimentação encontrada com os filtros atuais.
              </p>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* modal nova movimentação */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova movimentação de estoque</DialogTitle>
              <DialogDescription>
                Registre uma entrada, saída ou ajuste no estoque.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tipo de movimentação*</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...initialFormState,
                      produtoId: prev.produtoId,
                      tipo: v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRADA">
                      Entrada (compra ou recebimento)
                    </SelectItem>
                    <SelectItem value="SAIDA">
                      Saída (venda ou perda)
                    </SelectItem>
                    <SelectItem value="AJUSTE">
                      Ajuste (inventário)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Produto*</Label>
                <Popover
                  open={isProductPopoverOpen}
                  onOpenChange={setIsProductPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {form.produtoId
                        ? products.find((p) => p.id === form.produtoId)?.nome
                        : "Selecione o produto"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[450px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar por nome ou código de barras..."
                        value={productSearchTerm}
                        onValueChange={setProductSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                        <CommandGroup>
                          {filteredModalProducts.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.nome} ${p.codigoBarras || ""}`}
                              onSelect={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  produtoId: p.id,
                                  precoCusto: "",
                                }));
                                handleSetLastCostPrice(p.id);
                                setIsProductPopoverOpen(false);
                                setProductSearchTerm("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.produtoId === p.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div>
                                <p>{p.nome}</p>
                                {p.codigoBarras && (
                                  <p className="text-xs text-muted-foreground">
                                    Cód: {p.codigoBarras}
                                  </p>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Quantidade*</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex: 10"
                  value={form.quantidade}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      quantidade: e.target.value,
                    }))
                  }
                />
              </div>

              {form.tipo === "ENTRADA" && (
                <>
                  <div className="space-y-2">
                    <Label>Fornecedor*</Label>
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(v) => {
                          setForm((prev) => ({ ...prev, fornecedorId: v }));
                        }}
                        value={form.fornecedorId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o fornecedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((f: any) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowAddSupplierModal(true)}
                          >
                            <CirclePlus className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Adicionar fornecedor</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preço de custo*</Label>
                    <div className="relative">
                      <Input
                        value={form.precoCusto}
                        onChange={(e) => handlePriceInput(e.target.value)}
                        placeholder="R$ 0,00"
                        inputMode="numeric"
                        className="pr-10"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full"
                            onClick={() =>
                              handleSetLastCostPrice(form.produtoId)
                            }
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Usar último preço de custo</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de validade (opcional)</Label>
                    <Input
                      type="date"
                      value={form.validade}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          validade: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Observação (opcional)</Label>
                <Input
                  placeholder={
                    form.tipo === "ENTRADA"
                      ? "Ex: NF 12345"
                      : form.tipo === "SAIDA"
                      ? "Ex: venda balcão"
                      : "Ex: ajuste de inventário"
                  }
                  value={form.observacao}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      observacao: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveMovement}>Salvar movimentação</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AddSupplierModal
          isOpen={showAddSupplierModal}
          onClose={() => setShowAddSupplierModal(false)}
          onSupplierCreated={handleSupplierCreated}
        />
      </div>
    </TooltipProvider>
  );
};

export default Movements;
