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

// ===== COMPONENTE REUTILIZÁVEL DE FORMULÁRIO =====
const ClienteForm = ({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<Cliente>;
  onSubmit: (data: Partial<Cliente>) => void;
}) => {
  const [form, setForm] = useState({
    nome: initialData.nome || "",
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

// ======== TELA PRINCIPAL =========
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
        fetchAll().then(() => toast.info("🔄 Dados atualizados automaticamente"));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [location.pathname]);

  // === DADOS DERIVADOS ===
  const totalClientes = clientes.length;
  const totalVendas = sales.length;

  const vendasPorCliente = useMemo(() => {
    return clientes.map((c) => {
      const compras = sales.filter((v) => v.cliente?.id === c.id);
      const totalGasto = compras.reduce((acc, cur) => acc + Number(cur.total || 0), 0);
      return { nome: c.nome, totalVendas: compras.length, totalGasto };
    });
  }, [clientes, sales]);

  const ticketMedio =
    totalVendas > 0
      ? (sales.reduce((acc, v) => acc + Number(v.total || 0), 0) / totalVendas).toFixed(2)
      : "0.00";

  const clienteTop = vendasPorCliente.reduce(
    (max, c) => (c.totalGasto > (max?.totalGasto || 0) ? c : max),
    null as any
  );

  const vendasMensais = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach((v) => {
      const mes = new Date(v.criadoEm).toLocaleString("pt-BR", { month: "short" });
      map.set(mes, (map.get(mes) || 0) + Number(v.total || 0));
    });
    return Array.from(map.entries()).map(([mes, total]) => ({ mes, total }));
  }, [sales]);

  const produtosMaisVendidos = useMemo(() => {
    const contagem: Record<string, number> = {};
    sales.forEach((v) => {
      v.itens?.forEach((i) => {
        const nomeProduto = i.produto?.nome || "Desconhecido";
        contagem[nomeProduto] = (contagem[nomeProduto] || 0) + i.quantidade;
      });
    });
    return Object.entries(contagem)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 6);
  }, [sales]);

  const filteredClientes = clientes.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedClientes = filteredClientes.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredClientes.length / perPage);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9"];

  // === LOADING ===
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] space-y-3">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        <p className="text-muted-foreground">Carregando informações...</p>
      </div>
    );

  return (
    <motion.div
      className="p-8 space-y-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* === CABEÇALHO === */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu cadastro de clientes e acompanhe métricas de desempenho.
          </p>
        </div>

        {/* Botão de criação */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90">
              <UserPlus className="h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <ClienteForm
              onSubmit={(form) => {
                createCliente(form as Omit<Cliente, "id">);
                toast.success("✅ Cliente cadastrado com sucesso!");
                setIsCreateModalOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* === KPIs === */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: "Clientes", value: totalClientes, icon: Users, color: "blue" },
          { label: "Vendas", value: totalVendas, icon: ShoppingBag, color: "green" },
          { label: "Ticket Médio", value: `R$ ${ticketMedio}`, icon: DollarSign, color: "amber" },
          { label: "Cliente Top", value: clienteTop?.nome || "—", icon: Trophy, color: "purple" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className={`border-none shadow-md bg-gradient-to-r from-${stat.color}-50 to-${stat.color}-100`}
            >
              <CardContent className="flex justify-between items-center p-5">
                <div>
                  <p className={`text-sm text-${stat.color}-800`}>{stat.label}</p>
                  <h2 className="text-3xl font-bold">{stat.value}</h2>
                </div>
                <stat.icon className={`text-${stat.color}-600 w-10 h-10`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* === GRÁFICOS === */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Pizza */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Distribuição de Clientes por Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vendasPorCliente} dataKey="totalVendas" nameKey="nome" outerRadius={100} label>
                  {vendasPorCliente.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RechartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Barras */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Ranking de Clientes por Valor Gasto</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...vendasPorCliente].sort((a, b) => b.totalGasto - a.totalGasto).slice(0, 6)}
                layout="vertical"
              >
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={150} />
                <RechartTooltip />
                <Bar dataKey="totalGasto" fill="#3B82F6" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* === TABELA === */}
      <Card className="shadow-lg mt-10">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Visualize e gerencie seus clientes.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClientes.length > 0 ? (
                  paginatedClientes.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-muted/50 transition">
                      <TableCell>
                        <ClienteDetalhesModal cliente={cliente}>
                          <Button variant="link" className="p-0 h-auto text-blue-600 hover:underline">
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
                            toast.success("🗑️ Cliente removido com sucesso!");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-3">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground mt-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === MODAL DE EDIÇÃO === */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {selectedCliente && (
            <ClienteForm
              initialData={selectedCliente}
              onSubmit={(form: Cliente) => {
                updateCliente(selectedCliente.id, form);
                toast.success("✏️ Cliente atualizado com sucesso!");
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
