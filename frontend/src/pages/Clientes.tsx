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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cliente, useClientes } from "@/contexts/ClienteContext";
import { useSales } from "@/contexts/SalesContext";
import { useProdutos } from "@/contexts/ProdutoContext";
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
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  Loader2,
  Users,
  ShoppingBag,
  DollarSign,
  Trophy,
  Edit,
  Trash2,
  Search,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import ClienteDetalhesModal from "@/components/ClienteDetalhesModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocation } from "react-router-dom";

// =========================
// Utilitarios
// =========================
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9"];

const formatNomeCurto = (nome: string, limite = 18) =>
  nome.length > limite ? nome.slice(0, limite) + "..." : nome;

const limitarGrupo = <T extends { nome: string }>(
  data: (T & { valor: number })[],
  limite = 6
) => {
  if (!data.length) return [];
  const ordenado = [...data].sort((a, b) => b.valor - a.valor);
  if (ordenado.length <= limite) return ordenado;
  const principais = ordenado.slice(0, limite - 1);
  const outrosValor = ordenado
    .slice(limite - 1)
    .reduce((acc, item) => acc + item.valor, 0);
  return [...principais, { nome: "Outros", valor: outrosValor } as T & { valor: number }];
};

// =========================
// Formulario reutilizavel
// =========================
const ClienteForm = ({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<Cliente>;
  onSubmit: (data: Partial<Cliente>) => void;
}) => {
  const [form, setForm] = useState({
    nome: initialData?.nome || "",
    cpf: initialData?.cpf || "",
    email: initialData?.email || "",
    telefone: initialData?.telefone || "",
    endereco: initialData?.endereco || "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-4 py-2">
      {Object.entries(form).map(([key, value]) => (
        <div key={key} className="space-y-1">
          <Label className="capitalize">{key}</Label>
          <Input
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            type={key === "email" ? "email" : "text"}
            placeholder={`Digite o ${key}`}
          />
        </div>
      ))}
      <DialogFooter>
        <Button onClick={() => onSubmit(form)} className="bg-blue-600 text-white">
          Salvar
        </Button>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};

// =========================
// Tela principal Enterprise
// =========================
const Clientes = () => {
  const { clientes, createCliente, updateCliente, deleteCliente, fetchClientes } = useClientes();
  const { sales, fetchSales } = useSales();
  const { produtos, fetchProdutos } = useProdutos();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchClientes(), fetchSales(), fetchProdutos()]);
      setLoading(false);
    };
    fetchAll();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() =>
          toast.info("Dados atualizados automaticamente")
        );
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [location.pathname, fetchClientes, fetchSales, fetchProdutos]);

  // =========================
  // Dados derivados inteligentes
  // =========================
  const totalClientes = clientes.length;
  const totalVendas = sales.length;

  const vendasPorCliente = useMemo(() => {
    return clientes.map((c) => {
      const compras = sales.filter((v) => v.cliente?.id === c.id);
      const totalGasto = compras.reduce(
        (acc, cur) => acc + Number(cur.total || 0),
        0
      );
      return {
        id: c.id,
        nome: c.nome,
        nomeCurto: formatNomeCurto(c.nome),
        totalVendas: compras.length,
        totalGasto,
      };
    });
  }, [clientes, sales]);

  const faturamentoTotal = useMemo(
    () => sales.reduce((acc, v) => acc + Number(v.total || 0), 0),
    [sales]
  );

  const ticketMedio =
    totalVendas > 0
      ? faturamentoTotal / totalVendas
      : 0;

  const clienteTopLtv = useMemo(() => {
    return vendasPorCliente.reduce(
      (max, c) => (c.totalGasto > (max?.totalGasto || 0) ? c : max),
      null as null | (typeof vendasPorCliente)[number]
    );
  }, [vendasPorCliente]);

  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();

  const vendasMesAtual = useMemo(
    () =>
      sales.filter((v) => {
        const data = new Date(v.criadoEm as any);
        if (Number.isNaN(data.getTime())) return false;
        return (
          data.getMonth() === mesAtual && data.getFullYear() === anoAtual
        );
      }),
    [sales, mesAtual, anoAtual]
  );

  const valorMesAtual = vendasMesAtual.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  );

  const novosClientesMesAtual = useMemo(
    () =>
      clientes.filter((c) => {
        const data = new Date((c as any).criadoEm);
        if (Number.isNaN(data.getTime())) return false;
        return (
          data.getMonth() === mesAtual && data.getFullYear() === anoAtual
        );
      }).length,
    [clientes, mesAtual, anoAtual]
  );

  const clientesAtivos = useMemo(
    () =>
      vendasPorCliente.filter((c) => c.totalVendas > 0).length,
    [vendasPorCliente]
  );

  const clientesAtivosPercentual =
    totalClientes > 0 ? (clientesAtivos / totalClientes) * 100 : 0;

  const frequenciaMedia =
    totalClientes > 0 ? totalVendas / totalClientes : 0;

  const vendasMensais = useMemo(() => {
    const mapa = new Map<
      string,
      { label: string; total: number }
    >();

    sales.forEach((v) => {
      const data = new Date(v.criadoEm as any);
      if (Number.isNaN(data.getTime())) return;
      const chave = `${data.getFullYear()}-${data.getMonth()}`;
      const label = data.toLocaleString("pt-BR", {
        month: "short",
        year: "2-digit",
      });
      const atual = mapa.get(chave) || { label, total: 0 };
      atual.total += Number(v.total || 0);
      mapa.set(chave, atual);
    });

    return Array.from(mapa.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, val]) => ({
        mes: val.label,
        total: val.total,
      }));
  }, [sales]);

  const produtosMaisVendidos = useMemo(() => {
    const contagem: Record<string, number> = {};
    sales.forEach((v) => {
      v.itens?.forEach((i: any) => {
        const nomeProduto = i.produto?.nome || "Desconhecido";
        const qtd = Number(i.quantidade || 0);
        contagem[nomeProduto] = (contagem[nomeProduto] || 0) + qtd;
      });
    });
    const lista = Object.entries(contagem)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 6);

    if (!lista.length) {
      return [{ nome: "Sem dados", quantidade: 0 }];
    }
    return lista;
  }, [sales]);

  const distribuicaoClientesPorVendas = useMemo(() => {
    const base = vendasPorCliente.filter((c) => c.totalVendas > 0);
    if (!base.length) {
      return [{ nome: "Sem dados", valor: 1 }];
    }
    const comValor = base.map((c) => ({
      nome: c.nome,
      valor: c.totalVendas,
    }));
    return limitarGrupo(comValor, 8);
  }, [vendasPorCliente]);

  const rankingClientesValor = useMemo(() => {
    const lista = [...vendasPorCliente]
      .filter((c) => c.totalGasto > 0)
      .sort((a, b) => b.totalGasto - a.totalGasto)
      .slice(0, 8);

    if (!lista.length) {
      return [{ nome: "Sem dados", totalGasto: 0 }];
    }
    return lista;
  }, [vendasPorCliente]);

  const filteredClientes = clientes.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedClientes = filteredClientes.slice(
    (page - 1) * perPage,
    page * perPage
  );
  const totalPages = Math.ceil(filteredClientes.length / perPage);

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] space-y-3">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        <p className="text-muted-foreground">
          Carregando informacoes de clientes e vendas...
        </p>
      </div>
    );
  }

  // =========================
  // Render
  // =========================
  return (
    <motion.div
      className="px-4 sm:px-6 lg:px-10 py-6 space-y-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Cabecalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visao geral completa do relacionamento com clientes, desempenho de
            vendas e produtos.
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90">
              <UserPlus className="h-4 w-4" />
              Novo cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo cliente</DialogTitle>
            </DialogHeader>
            <ClienteForm
              onSubmit={(form) => {
                createCliente(form as Omit<Cliente, "id">);
                toast.success("Cliente cadastrado com sucesso.");
                setIsCreateModalOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs principais */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Clientes */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="flex justify-between items-center p-5">
              <div>
                <p className="text-xs text-blue-800">Total de clientes</p>
                <h2 className="text-3xl font-bold text-blue-700">
                  {totalClientes}
                </h2>
                <p className="text-xs text-blue-700 mt-1">
                  {clientesAtivos} ativos em vendas
                </p>
              </div>
              <Users className="text-blue-600 w-10 h-10" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Faturamento total */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-sm bg-gradient-to-r from-emerald-50 to-emerald-100">
            <CardContent className="flex justify-between items-center p-5">
              <div>
                <p className="text-xs text-emerald-800">Faturamento total</p>
                <h2 className="text-3xl font-bold text-emerald-700">
                  R{"$ "}
                  {faturamentoTotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h2>
                <p className="text-xs text-emerald-700 mt-1">
                  R{"$ "}
                  {valorMesAtual.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  neste mes
                </p>
              </div>
              <DollarSign className="text-emerald-600 w-10 h-10" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Ticket medio */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-none shadow-sm bg-gradient-to-r from-amber-50 to-amber-100">
            <CardContent className="flex justify-between items-center p-5">
              <div>
                <p className="text-xs text-amber-800">Ticket medio</p>
                <h2 className="text-3xl font-bold text-amber-700">
                  R{"$ "}
                  {ticketMedio.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h2>
                <p className="text-xs text-amber-700 mt-1">
                  {frequenciaMedia.toFixed(1)} vendas por cliente
                </p>
              </div>
              <ShoppingBag className="text-amber-600 w-10 h-10" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Cliente destaque */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-sm bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="flex justify-between items-center p-5">
              <div>
                <p className="text-xs text-purple-800">Cliente destaque</p>
                <h2 className="text-lg font-semibold text-purple-700 truncate max-w-[180px]">
                  {clienteTopLtv?.nome || "Nenhum ainda"}
                </h2>
                <p className="text-xs text-purple-700 mt-1">
                  LTV R{"$ "}
                  {(clienteTopLtv?.totalGasto || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <Trophy className="text-purple-600 w-10 h-10" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Linha com graficos principais */}
      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        {/* Evolucao mensal de faturamento */}
        <Card className="shadow-md lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Evolucao mensal do faturamento
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Comportamento das vendas ao longo dos meses
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vendasMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) =>
                    `R$ ${Number(v).toLocaleString("pt-BR", {
                      maximumFractionDigits: 0,
                    })}`
                  }
                />
                <RechartTooltip
                  formatter={(valor: any) =>
                    `R$ ${Number(valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Faturamento"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuicao clientes por vendas */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Distribuicao de clientes por quantidade de vendas
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Principais clientes em volume de compras
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuicaoClientesPorVendas}
                  dataKey="valor"
                  nameKey="nome"
                  outerRadius={90}
                  label={({ name, value }) => `${formatNomeCurto(name)} (${value})`}
                >
                  {distribuicaoClientesPorVendas.map((_, i) => (
                    <Cell
                      key={`pie-cell-${i}`}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartTooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de graficos e resumos */}
      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        {/* Ranking de clientes por valor gasto */}
        <Card className="shadow-md lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Ranking de clientes por valor gasto
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Principais clientes em faturamento acumulado
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rankingClientesValor}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) =>
                    `R$ ${Number(v).toLocaleString("pt-BR", {
                      maximumFractionDigits: 0,
                    })}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="nome"
                  tick={{ fontSize: 10 }}
                  width={140}
                />
                <RechartTooltip
                  formatter={(valor: any) =>
                    `R$ ${Number(valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  }
                />
                <Bar dataKey="totalGasto" fill="#3B82F6" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resumo rapido de comportamento */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Resumo de comportamento
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Indicadores sinteticos de clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] sm:h-[320px] flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Clientes ativos em vendas
              </span>
              <span className="font-semibold">
                {clientesAtivos} (
                {clientesAtivosPercentual.toFixed(1)}
                %)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Novos clientes neste mes
              </span>
              <span className="font-semibold">{novosClientesMesAtual}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Produtos mais vendidos (itens)
              </span>
              <span className="font-semibold">
                {produtosMaisVendidos[0]?.nome || "Sem dados"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Valor vendido neste mes
              </span>
              <span className="font-semibold">
                R{"$ "}
                {valorMesAtual.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use estes indicadores para identificar oportunidades de
              relacionamento, campanhas de fidelizacao e ofertas direcionadas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Produtos mais vendidos (opcional) */}
      <Card className="shadow-md mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">
            Produtos mais vendidos aos clientes
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Itens com maior volume de saida nas vendas
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[220px] sm:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={produtosMaisVendidos}>
              <XAxis
                dataKey="nome"
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartTooltip />
              <Bar dataKey="quantidade" fill="#0EA5E9" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de clientes */}
      <Card className="shadow-md mt-8">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Lista de clientes
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Visualize, edite e acompanhe seus clientes cadastrados.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereco</TableHead>
                  <TableHead className="text-center">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClientes.length > 0 ? (
                  paginatedClientes.map((cliente) => (
                    <TableRow
                      key={cliente.id}
                      className="hover:bg-muted/40 transition"
                    >
                      <TableCell>
                        <ClienteDetalhesModal cliente={cliente}>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600 hover:underline"
                          >
                            {cliente.nome}
                          </Button>
                        </ClienteDetalhesModal>
                      </TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>{cliente.endereco}</TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCliente(cliente);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            deleteCliente(cliente.id);
                            toast.success("Cliente removido com sucesso.");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground mt-2">
                Pagina {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Proxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edicao */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          {selectedCliente && (
            <ClienteForm
              initialData={selectedCliente}
              onSubmit={(form: Cliente) => {
                updateCliente(selectedCliente.id, form);
                toast.success("Cliente atualizado com sucesso.");
                setIsEditModalOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Clientes;
