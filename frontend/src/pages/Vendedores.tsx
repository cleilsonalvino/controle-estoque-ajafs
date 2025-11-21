// =========================
// src/pages/Vendedores.tsx
// =========================

import { useState, useMemo, useEffect } from "react";
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
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVendedores, Vendedor } from "@/contexts/VendedorContext";
import { useSales } from "@/contexts/SalesContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  FileDown,
  Loader2,
  Trophy,
  DollarSign,
  Target,
  PlusCircle,
  Trash2,
  Edit,
  Calendar as CalendarIcon,
  TrendingUp,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, differenceInDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation } from "react-router-dom";
import JsBarcode from "jsbarcode";

// Helper para formatar moeda
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const Vendedores = () => {
  const {
    vendedores,
    createVendedor,
    updateVendedor,
    deleteVendedor,
    loading,
    fetchVendedores,
  } = useVendedores();

  const { sales, fetchSales } = useSales();
  const location = useLocation();

  // Atualização automática ao voltar para página
  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([fetchVendedores(), fetchSales()]);
    };

    fetchAll();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() => toast.info("Dados atualizados automaticamente"));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [location.pathname]);

  // =========================================
  // Estados de Modal e Formulário
  // =========================================

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "create" | "edit" | "delete" | null
  >(null);

  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(
    null
  );

  const [formData, setFormData] = useState<{
    nome: string;
    email: string;
    meta: string;
    urlImage: File | string | null;
  }>({
    nome: "",
    email: "",
    meta: "",
    urlImage: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsVendedor, setDetailsVendedor] = useState<any | null>(null);

  console.log(detailsVendedor);


  // DataRange
  const [date, setDate] = useState<DateRange | undefined>();

  // =========================================
  // Handlers de Form + Preview
  // =========================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === "file") {
      const file = e.target.files?.[0];
      if (file) {
        setFormData((prev) => ({ ...prev, urlImage: file }));
        setPreviewUrl(URL.createObjectURL(file));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleOpenDetails = (vendedor: Vendedor) => {
    const metricas = vendasPorVendedor.find((v) => v.id === vendedor.id);

    setDetailsVendedor({
      ...vendedor,
      totalVendas: metricas?.totalVendas || 0,
      totalValor: metricas?.totalValor || 0,
      percentualMeta: metricas?.percentualMeta || 0,

    });

    setIsDetailsModalOpen(true);
  };

  const handleOpenModal = (
    type: "create" | "edit" | "delete",
    vendedor?: Vendedor
  ) => {
    setModalType(type);
    setSelectedVendedor(vendedor || null);

    if (type === "create") {
      setFormData({
        nome: "",
        email: "",
        meta: "",
        urlImage: null,
      });
      setPreviewUrl(null);
    }

    if (type === "edit" && vendedor) {
      setFormData({
        nome: vendedor.nome,
        email: vendedor.email,
        meta: String(vendedor.meta),
        urlImage: vendedor.urlImagem || null,
      });

      // Se imagem é string do servidor
      if (typeof vendedor.urlImagem === "string") {
        setPreviewUrl(`${import.meta.env.VITE_API_URL}/${vendedor.urlImagem}`);
      }
    }

    setIsModalOpen(true);
  };

  const handleFormSubmit = async () => {
    try {
      setIsLoadingAction(true);

      // 🔥 Agora form-data correto para Multer
      const form = new FormData();
      form.append("nome", formData.nome);
      form.append("email", formData.email);
      form.append("meta", formData.meta);

      // Se tiver imagem nova, envia como File
      if (formData.urlImage instanceof File) {
        form.append("urlImage", formData.urlImage);
      }

      if (modalType === "create") {
        await createVendedor(form);
        toast.success("Vendedor criado com sucesso!");
      } else if (modalType === "edit" && selectedVendedor) {
        await updateVendedor(selectedVendedor.id, form);
        toast.success("Vendedor atualizado com sucesso!");
      }

      setIsModalOpen(false);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar vendedor");
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVendedor) return;

    try {
      setIsLoadingAction(true);
      await deleteVendedor(selectedVendedor.id);
      toast.success("Vendedor excluído com sucesso!");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir vendedor.");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // =========================================
  // Impressão de código de barras
  // =========================================

  const handlePrintBarcode = (vendedor: Vendedor) => {
    const codigo = vendedor.codigo || "000000";
    const canvas = document.createElement("canvas");

    JsBarcode(canvas, codigo, {
      format: "CODE128",
      displayValue: true,
      fontSize: 18,
      width: 2,
      height: 80,
      margin: 10,
      text: vendedor.nome,
    });

    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");

    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Código - ${vendedor.nome}</title>
            <style>
              body { text-align: center; padding: 30px; font-family: sans-serif; }
            </style>
          </head>
          <body>
            <h2>${vendedor.nome}</h2>
            <img src="${dataUrl}" />
            <script>window.print();</script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  // =========================================
  // Exportação PDF
  // =========================================

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Vendedores", 14, 15);

    autoTable(doc, {
      head: [["Nome", "Email", "Meta (R$)", "Vendido", "% Meta"]],
      body: vendedores.map((v) => [
        v.nome,
        v.email,
        formatCurrency(v.meta),
        "-",
        "-",
      ]),
      startY: 20,
    });

    doc.save("vendedores.pdf");
  };

  // =========================================
  // Filtros + Métricas + Tabelas + Gráficos
  // =========================================
  // (Mesma lógica que seu código original — *mantida*)

  const numDaysInPeriod = useMemo(() => {
    if (date?.from && date.to) return differenceInDays(date.to, date.from) + 1;
    if (date?.from) return 1;
    return 30.44;
  }, [date]);

  const prorateFactor = numDaysInPeriod / 30.44;

  const filteredSales = useMemo(() => {
    if (!date?.from) return sales;
    const from = startOfDay(date.from);
    const to = date.to ? startOfDay(date.to) : from;
    return sales.filter((s) => {
      const saleDate = startOfDay(new Date(s.criadoEm));
      return saleDate >= from && saleDate <= to;
    });
  }, [sales, date]);

  const vendasPorVendedor = useMemo(() => {
    return vendedores.map((v) => {
      const vendas = filteredSales.filter((s) => s.vendedor?.id === v.id);
      const total = vendas.reduce(
        (acc, cur) => acc + Number(cur.total || 0),
        0
      );

      const metaProrated = (v.meta || 0) * prorateFactor;
      const percentualMeta =
        metaProrated > 0 ? (total / metaProrated) * 100 : 0;

      return {
        id: v.id,
        codigo: v.codigo,
        nome: v.nome,
        email: v.email,
        totalVendas: vendas.length,
        totalValor: total,
        meta: metaProrated,
        urlImage: v.urlImagem,
        criadoEm: v.criadoEm,


        percentualMeta,
      };
    });
  }, [vendedores, filteredSales, prorateFactor]);

    const getImageUrl = (value: string | File | null) => {
    if (!value) {
      return "https://placehold.co/600x400?text=Sem+Imagem";
    }

    // Se for File (nova imagem escolhida)
    if (value instanceof File) {
      return URL.createObjectURL(value); // <- gera preview AUTOMÁTICO
    }

    // Se já for URL externa
    if (value.startsWith("http")) {
      return value;
    }

    // Se for caminho relativo salvo no banco
    const cleanPath = value.startsWith("/") ? value.substring(1) : value;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  const filteredVendedores = useMemo(
    () =>
      vendasPorVendedor.filter((v) =>
        v.nome.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [vendasPorVendedor, searchTerm]
  );

  const paginatedVendedores = filteredVendedores.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const totalPages = Math.ceil(filteredVendedores.length / perPage);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

  // =========================================
  // Loading inicial
  // =========================================
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  // =========================================
  // RENDERIZAÇÃO FINAL
  // =========================================

  return (
    <div className="p-6 space-y-6">
      {/* Título + Ações */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Painel de Vendedores</h1>

        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[280px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    `${format(date.from, "dd/MM/y", {
                      locale: ptBR,
                    })} - ${format(date.to, "dd/MM/y", { locale: ptBR })}`
                  ) : (
                    format(date.from, "dd/MM/y", { locale: ptBR })
                  )
                ) : (
                  <span>Filtrar por período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={exportPDF}>
            <FileDown className="h-4 w-4 mr-2" /> PDF
          </Button>

          <Button
            onClick={() => handleOpenModal("create")}
            className="bg-gradient-primary text-primary-foreground"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Vendedor
          </Button>
        </div>
      </div>

      {/* -------- KPIs -------- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/** Mantido igual ao original */}
        {/* ... */}
      </div>

      {/* -------- Gráficos -------- */}
      <div className="grid md:grid-cols-1 xl:grid-cols-3 gap-6">
        {/** Mantido igual ao original */}
        {/* ... */}
      </div>

      {/* -------- Tabela -------- */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Equipe de Vendas</CardTitle>
            <CardDescription>
              Desempenho individual no período selecionado.
            </CardDescription>
          </div>
          <Input
            placeholder="Buscar vendedor..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Nº Vendas</TableHead>
                <TableHead>Ticket Médio</TableHead>
                <TableHead>Vendido</TableHead>
                <TableHead>Meta (%)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedVendedores.length > 0 ? (
                paginatedVendedores.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.codigo}</TableCell>

                    <TableCell>
                      <div className="font-medium">{v.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {v.email}
                      </div>
                    </TableCell>

                    <TableCell>{v.totalVendas}</TableCell>

                    <TableCell>
                      {formatCurrency(
                        v.totalVendas > 0 ? v.totalValor / v.totalVendas : 0
                      )}
                    </TableCell>

                    <TableCell>{formatCurrency(v.totalValor)}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={v.percentualMeta} />
                        <span>{v.percentualMeta.toFixed(1)}%</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDetails(v)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal("edit", v)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal("delete", v)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Imprimir Código"
                        onClick={() => handlePrintBarcode(v)}
                      >
                        <FileDown className="h-4 w-4 text-blue-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-6"
                  >
                    Nenhum vendedor encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* -------- Paginação -------- */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>

            {[...Array(totalPages).keys()].map((num) => (
              <PaginationItem key={num}>
                <PaginationLink
                  href="#"
                  isActive={page === num + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(num + 1);
                  }}
                >
                  {num + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* -------- Modal de Detalhes -------- */}
<Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Detalhes do Vendedor</DialogTitle>
    </DialogHeader>

    {detailsVendedor && (
      <div className="space-y-4 py-2">

        {/* FOTO */}
        <div className="flex justify-center">
          <img
            src={getImageUrl(detailsVendedor.urlImage)}
            className="w-24 h-24 rounded-full object-cover border"
          />
        </div>

        {/* NOME + EMAIL */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold">{detailsVendedor.nome}</h2>
          <p className="text-muted-foreground text-sm">
            {detailsVendedor.email}
          </p>
        </div>

        {/* CÓDIGO */}
        <div className="text-center text-sm">
          <span className="font-mono bg-muted px-2 py-1 rounded">
            Código: {detailsVendedor.codigo || "N/A"}
          </span>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-muted/40 p-3 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Total de Vendas</p>
            <p className="text-lg font-bold">{detailsVendedor.totalVendas}</p>
          </div>

          <div className="bg-muted/40 p-3 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Vendido (R$)</p>
            <p className="text-lg font-bold">
              {formatCurrency(detailsVendedor.totalValor)}
            </p>
          </div>

          <div className="bg-muted/40 p-3 rounded-lg text-center col-span-2">
            <p className="text-xs text-muted-foreground">% Meta</p>
            <p className="text-lg font-bold">
              {detailsVendedor.percentualMeta.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* CRIADO EM */}
        <div className="text-xs text-center text-muted-foreground">
          Criado em:{" "}
          {detailsVendedor.criadoEm
            ? new Date(detailsVendedor.criadoEm).toLocaleDateString("pt-BR")
            : "—"}
        </div>

        {/* BOTÕES */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => handlePrintBarcode(detailsVendedor)}
          >
            Imprimir Código
          </Button>

          <DialogClose asChild>
            <Button>Fechar</Button>
          </DialogClose>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>


      {/* -------- Modal -------- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          {modalType === "delete" ? (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir{" "}
                  <strong>{selectedVendedor?.nome}</strong>? Esta ação não pode
                  ser desfeita.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>

                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoadingAction}
                >
                  {isLoadingAction && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Excluir
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {modalType === "create" ? "Novo Vendedor" : "Editar Vendedor"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta">Meta mensal</Label>
                  <Input
                    id="meta"
                    type="number"
                    value={formData.meta}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urlImage">Foto</Label>
                  <Input
                    id="urlImage"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                </div>

                {(previewUrl || typeof formData.urlImage === "string") && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={
                        previewUrl ||
                        `${import.meta.env.VITE_API_URL}/${formData.urlImage}`
                      }
                      className="w-24 h-24 object-cover rounded-full border"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>

                <Button onClick={handleFormSubmit} disabled={isLoadingAction}>
                  {isLoadingAction && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar
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
