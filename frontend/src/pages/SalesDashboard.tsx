import {isAxiosError} from "axios";
import { saveAs } from "file-saver";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Eye,
  FileText,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Badge, // Adicionado para feedback de loading
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
// import * as XLSX from "xlsx"; // Removido pois ExcelJS está sendo usado

import { useSales } from "@/contexts/SalesContext";
import { useProdutos, Produto } from "@/contexts/ProdutoContext";
import { useCategories, Category } from "@/contexts/CategoryContext";

// --- Contextos e Tipos Assumidos ---
// Assumindo que estes contextos existem, conforme especificação da API
import { useClientes, Cliente } from "@/contexts/ClienteContext";
import { useVendedores, Vendedor } from "@/contexts/VendedorContext";
// ------------------------------------

import { useEffect, useMemo, useState } from "react";
import GerarRelatorioNF from "@/components/GerarRelatorioNF";
import SaleDetalhesModal from "@/components/SaleDetalhesModal";
import ClienteDetalhesModal from "@/components/ClienteDetalhesModal";
import { Sale } from "@/contexts/SalesContext"; // Removido SaleData se não for usado
import {api} from "@/lib/api";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import TopSellingProducts from "@/components/TopSellingProducts";

// ========================
// Utils
// ========================
const toNumber = (v: unknown) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace?.(",", ".") ?? v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// const COLORS = [
//   "#0088FE",
//   "#00C49F",
//   "#FFBB28",
//   "#FF8042",
//   "#A28CFE",
//   "#FF6B6B",
// ];

// chave mês/ano para não misturar anos
const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (d: Date) =>
  d.toLocaleString("pt-BR", { month: "short" }).replace(".", ""); // jan, fev...

const getClienteDisplay = (s: Sale) =>
  s?.cliente?.nome ?? "Cliente não informado";

// ========================
// Blocos auxiliares (Sem alterações)
// ========================
const SalesLast6Months = () => {
  const { sales: allSalesRaw } = useSales();
  const allSales = Array.isArray(allSalesRaw) ? allSalesRaw : [];

  const salesData = useMemo(() => {
    const today = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      return { key: monthKey(d), month: monthLabel(d), value: 0, products: 0 };
    }).reverse();

    const seed = last6Months.reduce<
      Record<
        string,
        { key: string; month: string; value: number; products: number }
      >
    >((acc, m) => ({ ...acc, [m.key]: m }), {});

    const salesByMonth = allSales.reduce((acc, sale) => {
      const saleDate = new Date(sale.criadoEm);
      const key = monthKey(saleDate);
      if (acc[key]) {
        acc[key].value += toNumber(sale.total);
        const itens = Array.isArray(sale.itens) ? sale.itens : [];
        acc[key].products += itens.reduce(
          (sum, item) => sum + toNumber(item.quantidade),
          0
        );
      }
      return acc;
    }, seed);

    return Object.values(salesByMonth);
  }, [allSales]);

  const maxValue = Math.max(...salesData.map((d) => d.value), 70000);

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
                <div className="text-sm font-medium w-10 capitalize">
                  {item.month}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-primary h-2 rounded-full"
                      style={{
                        width: `${
                          maxValue > 0 ? (item.value / maxValue) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  {fmtBRL(item.value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.products} produtos
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
  const { sales: allSalesRaw } = useSales();
  const { produtos: produtosRaw } = useProdutos() as { produtos: Produto[] };
  const { categories: categoriesRaw } = useCategories() as {
    categories: Category[];
  };
  const allSales = Array.isArray(allSalesRaw) ? allSalesRaw : [];
  const produtos = Array.isArray(produtosRaw) ? produtosRaw : [];
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];

  const categoryData = useMemo(() => {
    const byCat = new Map<string, number>(); // categoryId -> total R$

    for (const sale of allSales) {
      const itens = Array.isArray(sale.itens) ? sale.itens : [];
      for (const item of itens) {
        const p = produtos.find((prod) => prod.id === item.produtoId);
        const catId = p?.categoria?.id;
        if (!catId) continue;
        const value =
          toNumber(item.quantidade ?? item.quantidade) *
          toNumber(item.precoCusto);
        byCat.set(catId, (byCat.get(catId) ?? 0) + value);
      }
    }

    const total = [...byCat.values()].reduce((sum, v) => sum + v, 0);

    return categories.map((cat) => {
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
        <CardDescription>
          Distribuição de vendas entre categorias de produtos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categoryData.map((c) => (
            <div key={c.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-sm text-muted-foreground">
                  {c.percentage.toFixed(2)}%
                </span>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { sales: allSalesRaw, cancelSale, fetchSales } = useSales();
  const { produtos, fetchProdutos } = useProdutos() as {
    produtos: Produto[];
    fetchProdutos: () => void;
  };
  const { categories, fetchCategories } = useCategories() as {
    categories: Category[];
    fetchCategories: () => void;
  };
  // Contextos assumidos para filtros
  const { clientes, fetchClientes } = useClientes() as {
    clientes: Cliente[];
    fetchClientes: () => void;
  };
  const { vendedores, fetchVendedores } = useVendedores() as {
    vendedores: Vendedor[];
    fetchVendedores: () => void;
  };
  const location = useLocation();

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleForNotaFiscal, setSaleForNotaFiscal] = useState<Sale | null>(null);

  // === REFRESH AUTOMÁTICO ===
  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetchSales?.(),
        fetchProdutos?.(),
        fetchCategories?.(),
        fetchClientes?.(),
        fetchVendedores?.(),
      ]);
    };

    // Roda ao abrir a rota
    fetchAll();

    // Atualiza ao voltar foco na aba
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() => {
          toast.info("Dados atualizados automaticamente");
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname]);

  // Dados brutos para os cards do dashboard
  const allSales = Array.isArray(allSalesRaw) ? allSalesRaw : [];

  // --- Novos Estados para Filtros da API ---
  const [filterClienteId, setFilterClienteId] = useState("");
  const [filterVendedorId, setFilterVendedorId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFormaPagamento, setFilterFormaPagamento] = useState("");
  const [filterDataInicio, setFilterDataInicio] = useState("");
  const [filterDataFim, setFilterDataFim] = useState("");

  const [tableData, setTableData] = useState<Sale[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  // ========================
  // Dados derivados (memo) - PARA OS CARDS DO DASHBOARD
  // (Usam `allSales` - todos os dados)
  // ========================

  // (Toda a lógica de `totalRevenue` ... `topCustomers` ... `paymentMethods` ... `topProducts` permanece a mesma)
  // ... (código existente omitido por brevidade) ...
  const totalRevenue = useMemo(
    () => allSales.reduce((acc, s) => acc + toNumber(s.total), 0),
    [allSales]
  );
  const numberOfSales = allSales.length;
  const averageTicket = numberOfSales > 0 ? totalRevenue / numberOfSales : 0;

  const pendingSales = allSales.filter((s) => s.status === "Pendente").length;
  const cancelledSales = allSales.filter(
    (s) => s.status === "Cancelada"
  ).length;

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const lastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const currentYear = now.getFullYear();
  const lastMonthYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;

  const currentMonthSales = allSales.filter((s) => {
    const d = new Date(s.criadoEm);
    return (
      d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear
    );
  });
  const lastMonthSales = allSales.filter((s) => {
    const d = new Date(s.criadoEm);
    return d.getMonth() === lastMonthIndex && d.getFullYear() === lastMonthYear;
  });

  const currentMonthRevenue = currentMonthSales.reduce(
    (acc, s) => acc + toNumber(s.total),
    0
  );
  const lastMonthRevenue = lastMonthSales.reduce(
    (acc, s) => acc + toNumber(s.total),
    0
  );
  const monthlyGrowth =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  const averageDailySales = useMemo(() => {
    const byDay = allSales.reduce<Record<string, number>>((acc, s) => {
      const k = new Date(s.criadoEm).toLocaleDateString("pt-BR");
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
    const dias = Object.keys(byDay).length;
    return dias > 0 ? numberOfSales / dias : 0;
  }, [allSales, numberOfSales]);

  // (O resto dos useMemos para os cards do dashboard...)
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

  const paymentMethods = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of allSales) {
      const name = s.formaPagamento ?? "não informado";
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [allSales]);

  // ========================
  // CARREGAMENTO DE DADOS FILTRADOS (Relatório)
  // ========================
  useEffect(() => {
    const fetchFilteredSales = async () => {
      setIsLoadingTable(true);
      setTableError(null);

      const params = new URLSearchParams();

      if (filterClienteId) params.append("clienteId", filterClienteId);
      if (filterVendedorId) params.append("vendedorId", filterVendedorId);
      if (filterStatus && filterStatus !== "todos")
        params.append("status", filterStatus);
      if (filterFormaPagamento && filterFormaPagamento !== "todos")
        params.append("formaPagamento", filterFormaPagamento);
      if (filterDataInicio) params.append("dataInicio", filterDataInicio);
      if (filterDataFim) params.append("dataFim", filterDataFim);

      try {
        const queryString = params.toString();
        const url = queryString
          ? `/vendas/filtrar?${queryString}`
          : "/vendas/filtrar";
        const response = await api.get(url);

        // Axios retorna o corpo da resposta em `response.data`
        const data = response.data as Sale[];

        setTableData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao filtrar vendas:", error);
        setTableError("Não foi possível carregar os dados do relatório.");
        setTableData([]);
      } finally {
        setIsLoadingTable(false);
      }
    };

    fetchFilteredSales();
  }, [
    filterClienteId,
    filterVendedorId,
    filterStatus,
    filterFormaPagamento,
    filterDataInicio,
    filterDataFim,
  ]);

  // ========================
  // Ações
  // ========================
  const handleCancelSale = async (saleId: string) => {
    // Usando um modal customizado em vez de window.confirm
    // (A lógica do modal deve ser implementada)
    // Por enquanto, simulando confirmação:
    const confirmed = true; // Substituir pela lógica do modal
    if (confirmed) {
      try {
        await cancelSale(saleId);
        alert("Venda cancelada com sucesso!"); // Substituir por Toast/Snackbar
        // Refrescar dados da tabela
        // TODO: Idealmente, o fetchFilteredSales seria chamado aqui
      } catch (error) {
        console.error("Erro ao cancelar venda:", error);
        alert("Erro ao cancelar venda."); // Substituir por Toast/Snackbar
      }
    }
  };

  const handleIssueNotaFiscal = (sale: Sale) => {
    setSaleForNotaFiscal(sale);
  };

  const confirmIssueNotaFiscal = (saleId: string) => {
    alert(`Simulando emissão de nota fiscal para a venda ${saleId}`);
    setSaleForNotaFiscal(null);
  };

  // ========================
  // Exportações (Atualizadas para usar tableData)
  // ========================
  const exportToPDF = () => {
    const doc = new jsPDF();

    (doc as any).autoTable({
      head: [
        ["Número", "Data", "Cliente", "Status", "Forma de Pagamento", "Valor"],
      ],
      body: tableData.map((s) => [
        // Alterado de filteredSales
        s.numero,
        new Date(s.criadoEm).toLocaleDateString("pt-BR"),
        s.cliente.cpf ?? "Cliente não informado",
        s.status,
        s.formaPagamento ?? "N/A",
        fmtBRL(toNumber(s.total)),
      ]),
      styles: { fontSize: 9 },
      theme: "striped",
      headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    doc.save("relatorio_vendas.pdf");
  };


  // Paginação (Atualizada para usar tableData)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // quantidade de vendas por página
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = [...tableData] // Alterado de filteredSales
    .sort(
      (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    )
    .slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handleClearFilters = () => {
    setFilterClienteId("todos");
    setFilterVendedorId("todos");
    setFilterStatus("todos");
    setFilterFormaPagamento("todos");
    setFilterDataInicio("");
    setFilterDataFim("");
  };

  async function handleDeleteHistorySales() {
    try {
      const confirmar = confirm(
        "Deseja mesmo excluir todo o histórico de vendas?\nEsta ação não poderá ser desfeita!"
      );

      if (!confirmar) return; // sai se o usuário cancelar

      const response = await api.delete("/vendas/delete-all");

      if (response.status === 200) {
        toast.success("Histórico de vendas excluído com sucesso!");
        // alert("Histórico de vendas excluído com sucesso!"); // opcional
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao excluir histórico:", error);

      if (isAxiosError(error)) {
        // Captura erro tratado vindo do back-end (CustomError)
        const mensagem =
          error.response?.data?.message ||
          "Erro ao deletar vendas. Tente novamente.";

        toast.error(mensagem); // Mostra o erro do backend (ex: "Não há vendas para deletar")
      } else {
        // Erros não relacionados ao Axios
        toast.error("Erro inesperado. Verifique sua conexão.");
      }
    }
  }

  // ========================
  // Render
  // ========================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard de Vendas
      </h1>

      {/* Cards resumo (Sem alterações, usam allSales) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 ">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
            <CardTitle className="text-sm font-medium">
              Faturamento Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtBRL(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {lastMonthRevenue > 0
                ? `Δ vs mês passado: ${monthlyGrowth.toFixed(1)}%`
                : "Sem base do mês anterior"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Número de Vendas
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfSales}</div>
            <p className="text-xs text-muted-foreground">
              Mês atual: {currentMonthSales.length} • Mês passado:{" "}
              {lastMonthSales.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtBRL(averageTicket)}</div>
            <p className="text-xs text-muted-foreground">
              Com base em {numberOfSales} vendas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-300 to-green-200 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lucro Estimado
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fmtBRL(totalRevenue * 0.25)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem suposta de 25%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas Pendentes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSales}</div>
            <p className="text-xs text-muted-foreground">
              Acompanhar conversão
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas Canceladas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledSales}</div>
            <p className="text-xs text-muted-foreground">Monitorar motivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores adicionais (Sem alterações) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyGrowth.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Receita mês atual vs anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas Médias por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageDailySales.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média no período total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total por Tipo de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              {paymentMethods.map((m) => (
                <div key={m.name} className="flex justify-between">
                  <span className="capitalize">{m.name}</span>
                  <span>{m.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mês atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fmtBRL(currentMonthRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas: {currentMonthSales.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos (Sem alterações) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesLast6Months />
        <TopSellingProducts />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <SalesByCategory />
      </div>

      {/* --- RELATÓRIO DETALHADO (MODIFICADO) --- */}
      <div className="flex justify-end mb-4">
        <GerarRelatorioNF />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Relatório Detalhado de Vendas</CardTitle>
          <CardDescription>
            Filtre e exporte os dados de vendas (dados da API).
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Filtros (Modificados) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Filtros de Seleção */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filterClienteId}
                onValueChange={setFilterClienteId}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Clientes</SelectItem>
                  {clientes?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterVendedorId}
                onValueChange={setFilterVendedorId}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Vendedores</SelectItem>
                  {vendedores?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterFormaPagamento}
                onValueChange={setFilterFormaPagamento}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Forma de Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Formas</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Cartão de Crédito">
                    Cartão de Crédito
                  </SelectItem>
                  <SelectItem value="Cartão de Débito">
                    Cartão de Débito
                  </SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="ml-10"
                onClick={() => {
                  handleDeleteHistorySales();
                }}
              >
                EXCLUIR DADOS
              </Button>
            </div>

            {/* Filtros de Data */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <label className="text-xs absolute -top-2 left-2 bg-white px-1 text-muted-foreground">
                  Data Início
                </label>
                <Input
                  type="date"
                  className="w-40"
                  value={filterDataInicio}
                  onChange={(e) => setFilterDataInicio(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="text-xs absolute -top-2 left-2 bg-white px-1 text-muted-foreground">
                  Data Fim
                </label>
                <Input
                  type="date"
                  className="w-40"
                  value={filterDataFim}
                  onChange={(e) => setFilterDataFim(e.target.value)}
                />
              </div>
            </div>

            {/* Botões de Exportação */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                disabled={isLoadingTable}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Tabela (Modificada) */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Forma de Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTable && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando dados...
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {tableError && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-red-500 py-10"
                  >
                    {tableError}
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingTable && !tableError && currentItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Nenhum resultado encontrado para os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingTable &&
                !tableError &&
                currentItems.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.numero}</TableCell>
                    <TableCell>
                      {new Date(s.criadoEm).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {s.cliente && (
                        <ClienteDetalhesModal
                          cliente={clientes.find((c) => c.id === s.cliente.id)}
                        >
                          <Button variant="link" className="p-0 h-auto">
                            {getClienteDisplay(s)}
                          </Button>
                        </ClienteDetalhesModal>
                      )}
                      {!s.cliente && getClienteDisplay(s)}
                    </TableCell>
                    <TableCell
                      className={
                        s.status === "Cancelada"
                          ? "text-red-500 font-semibold"
                          : s.status === "Pendente"
                          ? "text-yellow-500 font-medium"
                          : "text-green-500"
                      }
                    >
                      {s.status}
                    </TableCell>

                    <TableCell>{s.vendedor?.nome}</TableCell>
                    <TableCell className="text-right">
                      {s.formaPagamento}
                    </TableCell>
                    <TableCell className="text-right">
                      {fmtBRL(toNumber(s.total))}
                    </TableCell>
                    <TableCell className="text-center">
                      <SaleDetalhesModal sale={s}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </SaleDetalhesModal>
                      {s.status !== "Cancelada" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelSale(s.id)}
                          title="Cancelar Venda"
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* PAGINAÇÃO (Modificada) */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              {/* Página {currentPage} de {totalPages} (Total: {tableData.length}) */}
              Mostrando {Math.min(startIndex + 1, tableData.length)} a{" "}
              {Math.min(endIndex, tableData.length)} de {tableData.length}{" "}
              resultados
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || tableData.length === 0}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights (Sem alterações) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {monthlyGrowth < 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Queda nas Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As vendas diminuíram {monthlyGrowth.toFixed(2)}% em relação ao
                mês anterior.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Cliente do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomerOfMonth ? (
              <p className="text-sm text-muted-foreground">
                {topCustomerOfMonth.name}: {fmtBRL(topCustomerOfMonth.value)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ainda sem dados no mês.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projeção de Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A projeção de faturamento para o próximo mês é um placeholder.
              Ajuste para seu modelo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesDashboard;
