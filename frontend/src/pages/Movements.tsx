import AddSupplierModal from "@/components/AddSupplierModal";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api"; // Assumindo que sua config do Axios/API está aqui
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
  History, // NOVO ÍCONE
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
import { useSuppliers } from "@/contexts/SupplierContext"; // IMPORTANTE

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
  notes?: string;
  fornecedor?: string;
  precoCusto?: string;
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

  // Use o useSuppliers para obter a lista e o método de busca
  const { suppliers, fetchSuppliers } = useSuppliers(); // ESTADO E FUNÇÃO DO CONTEXTO
  // setSuppliers não é mais necessário, pois a lista é gerida pelo contexto

  const location = useLocation();

  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);

      // ✅ Usa fetchSuppliers do contexto
      await fetchSuppliers();

      const [movementsResponse, productsResponse] = await Promise.all([
        api.get("/estoque/movimentacoes"),
        api.get("/produtos"),
      ]);

      console.log(movementsResponse.data)

      const movementsData = movementsResponse.data.map((item: any) => ({
        id: item.id,
        type: item.tipo,
        product: item.produto?.nome || "Produto Deletado",
        quantity: Number(item.quantidade),
        reason: item.tipo,
        date: item.criadoEm,
        user: item.usuario?.nome || "Usuário do Sistema",
        fornecedor: item.fornecedor?.nome || "-",
        notes: item.observacao || null,
        precoCusto: item.precoCusto ? Number(item.precoCusto) : undefined,
        validade: item.validade,
      }));
      movementsData.sort(
        (a: { date: string }, b: { date: string }) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setMovements(movementsData);
      setProducts(productsResponse.data);
      // setSuppliers(suppliersResponse.data); // REMOVIDO: Agora é gerido pelo contexto
    } catch (error) {
      toast.error("Falha ao carregar dados da página.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO CALLBACK PARA RECARREGAR APÓS CRIAÇÃO
  const handleSupplierCreated = () => {
    // 1. Recarrega a lista de fornecedores do contexto
    fetchSuppliers();
    // 2. Fecha o modal de criação
    setShowAddSupplierModal(false);
    // 3. (Opcional) Mostra um toast de sucesso, se não for feito no modal filho
    toast.success("Fornecedor criado e lista atualizada!");
  };

  useEffect(() => {
    fetchAll();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() => toast.info("Dados atualizados automaticamente"));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname, fetchSuppliers]); // ADICIONAR fetchSuppliers como dependência

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        m.product.toLowerCase().includes(searchTermLower) ||
        (m.notes && m.notes.toLowerCase().includes(searchTermLower)) ||
        (m.usuario && m.usuario.nome.toLowerCase().includes(searchTermLower));
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

  const totalEntradas = filteredMovements
    .filter((m) => m.type === "ENTRADA")
    .reduce((acc, m) => acc + m.quantity, 0);
  const totalSaidas = filteredMovements
    .filter((m) => m.type === "SAIDA")
    .reduce((acc, m) => acc + m.quantity, 0);
  const totalAjustes = filteredMovements
    .filter((m) => m.type === "AJUSTE")
    .reduce((acc, m) => acc + m.quantity, 0);
  const saldoLiquido = totalEntradas - totalSaidas;

  const chartDataByType = Object.entries({
    Entrada: totalEntradas,
    Saída: totalSaidas,
    Ajuste: totalAjustes,
  }).map(([name, value]) => ({ name, value }));

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
    toast.info("Filtros limpos!");
  };

  const handleSaveMovement = async () => {
    if (!form.produtoId || !form.quantidade || !form.tipo) {
      toast.error("Preencha: Tipo, Produto e Quantidade.");
      return;
    }
    if (form.tipo === "ENTRADA" && (!form.fornecedorId || !form.precoCusto)) {
      toast.error(
        "Para Entradas, Fornecedor e Preço de Custo são obrigatórios."
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
        precoCusto: form.tipo === "ENTRADA" ? form.precoCusto : null,
        validade: form.tipo === "ENTRADA" ? form.validade || null : null,
        usuarioId: id,
      };

      await api.post("/estoque/movimentacao", payload);

      toast.success("Movimentação registrada com sucesso!");
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
        m.usuario.nome,
      ]),
    });
    doc.save("movimentacoes_estoque.pdf");
    toast.success("PDF gerado com sucesso!");
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

  // --- FUNÇÃO PARA PEGAR ÚLTIMO PREÇO DE CUSTO ---
  const handleSetLastCostPrice = (productId: string) => {
    if (!productId) return;

    const selectedProduct = products.find((p) => p.id === productId);
    if (!selectedProduct) return;

    // Pega os lotes do produto, do mais novo pro mais antigo
    const sortedLotes = selectedProduct.lote
      ?.filter((l) => l.precoCusto != null)
      .sort(
        (a, b) =>
          new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );

    const lastLote = sortedLotes?.[0];

    
      console.log("[handleSetLastCostPrice]", paginatedMovements)

    if (lastLote) {
      const lastPrice = Number(lastLote.precoCusto)
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      toast.info(`Preço de custo anterior (R$ ${lastPrice}) preenchido.`);

      setForm((prev) => ({ ...prev, precoCusto: lastPrice }));
    } else {
      toast.info(
        "Nenhum preço de custo anterior encontrado para este produto."
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Cabeçalho, estatísticas, gráficos, filtros e lista (sem alterações) */}
        <div className="flex justify-between flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
            <p className="text-muted-foreground">
              Painel completo de controle, análise e exportação.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nova Movimentação
            </Button>
            <Button
              variant="outline"
              onClick={exportPDF}
              disabled={!filteredMovements.length}
            >
              <FileDown className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Entradas
              </CardTitle>
              <ArrowUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntradas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">
                Saídas
              </CardTitle>
              <ArrowDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSaidas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Saldo Líquido
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div
                  className={`text-2xl font-bold ${
                    saldoLiquido >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {saldoLiquido}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-sm">
                    Diferença entre entradas e saídas.
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">
                Ajustes
              </CardTitle>
              <ArrowUpDown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAjustes}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
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
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Produtos Mais Movimentados</CardTitle>
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
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartTooltip />
                  <Bar dataKey="value" name="Quantidade" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="flex flex-wrap gap-4 pt-6 items-end">
            <Input
              placeholder="Buscar produto, usuário ou observação..."
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
                      ? `${format(date.from, "LLL dd, y")} - ${format(
                          date.to,
                          "LLL dd, y"
                        )}`
                      : format(date.from, "LLL dd, y")
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
        <Card>
          <CardHeader>
            <CardTitle>
              Histórico de Movimentações ({filteredMovements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-10">Carregando...</p>
            ) : paginatedMovements.length > 0 ? (
              <div className="space-y-2">
                {paginatedMovements.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {m.type === "ENTRADA" ? (
                          <ArrowUp className="text-green-600" />
                        ) : m.type === "SAIDA" ? (
                          <ArrowDown className="text-red-600" />
                        ) : (
                          <ArrowUpDown className="text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{m.product}</p>
                        <p className="text-sm text-muted-foreground">
                          {m.notes}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <p
                        className={`font-bold text-lg ${
                          m.type === "SAIDA"
                            ? "text-red-600"
                            : m.type === "ENTRADA"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {m.type === "SAIDA" ? "-" : "+"} {m.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(m.date), "dd/MM/yy HH:mm")} ·{" "}
                        {m.usuario?.nome ?? "Usuário do Sistema"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8">
                Nenhuma movimentação encontrada.
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
                <span className="px-4 py-2 text-sm">
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

        {/* MODAL COM MELHORIAS */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
              <DialogDescription>
                Registre uma entrada, saída ou ajuste no estoque.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tipo de Movimentação*</Label>
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
                      Entrada (Compra/Recebimento)
                    </SelectItem>
                    <SelectItem value="SAIDA">Saída (Venda/Perda)</SelectItem>
                    <SelectItem value="AJUSTE">Ajuste (Inventário)</SelectItem>
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
                                })); // Limpa o preço antigo antes de buscar o novo
                                handleSetLastCostPrice(p.id); // ATUALIZADO
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
                    setForm((prev) => ({ ...prev, quantidade: e.target.value }))
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
                          {/* LISTA DE FORNECEDORES ATUALIZADA PELO CONTEXTO */}
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
                  {/* --- CAMPO DE PREÇO ATUALIZADO --- */}
                  <div className="space-y-2">
                    <Label>Preço de Custo*</Label>
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
                    <Label>Data de Validade (Opcional)</Label>
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
                <Label>Observação (Opcional)</Label>
                <Input
                  placeholder={
                    form.tipo === "ENTRADA"
                      ? "Ex: NF 12345"
                      : form.tipo === "SAIDA"
                      ? "Ex: Venda balcão"
                      : "Ex: Ajuste de inventário"
                  }
                  value={form.observacao}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, observacao: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveMovement}>Salvar Movimentação</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Adicionado a prop onSupplierCreated para atualizar a lista */}
        <AddSupplierModal
          isOpen={showAddSupplierModal}
          onClose={() => setShowAddSupplierModal(false)}
          onSupplierCreated={handleSupplierCreated} // <--- NOVO CALLBACK
        />
      </div>
    </TooltipProvider>
  );
};

export default Movements;
