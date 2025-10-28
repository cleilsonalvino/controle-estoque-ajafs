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
} from "lucide-react";
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
import { toast } from "sonner";

const Clientes = () => {
  const { clientes, createCliente, updateCliente, deleteCliente, fetchClientes } = useClientes();
  const { sales, fetchSales } = useSales();
  const { produtos, fetchProdutos } = useProdutos();
  const location = useLocation();

  // === REFRESH AUTOMÁTICO ===
  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([fetchClientes(), fetchSales(), fetchProdutos()]);
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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  // === DADOS DERIVADOS ===
  const totalClientes = clientes.length;
  const totalVendas = sales.length;

  const vendasPorCliente = useMemo(() => {
    return clientes.map((c) => {
      const compras = sales.filter((v) => v.cliente?.id === c.id);
      const totalGasto = compras.reduce((acc, cur) => acc + Number(cur.total || 0), 0);
      return {
        nome: c.nome,
        totalVendas: compras.length,
        totalGasto,
      };
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

  const paginatedClientes = filteredClientes.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const totalPages = Math.ceil(filteredClientes.length / perPage);

  // === CORES ===
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9"];

  return (
    <div className="p-6 space-y-8">
      {/* === HEADER === */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input id="nome" />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input id="cpf" type="number" max={11}/>
              
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input id="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input id="telefone" />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input id="endereco" />
              </div>
              
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  const nome = (document.getElementById("nome") as HTMLInputElement).value;
                  const email = (document.getElementById("email") as HTMLInputElement).value;
                  const telefone = (document.getElementById("telefone") as HTMLInputElement).value;
                  const endereco = (document.getElementById("endereco") as HTMLInputElement).value;
                  createCliente({ nome, email, telefone, endereco });
                  setIsCreateModalOpen(false);
                }}
              >
                Salvar
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* === MÉTRICAS === */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-blue-800">Total de Clientes</p>
              <h2 className="text-2xl font-bold">{totalClientes}</h2>
            </div>
            <Users className="text-blue-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-green-800">Total de Vendas</p>
              <h2 className="text-2xl font-bold">{totalVendas}</h2>
            </div>
            <ShoppingBag className="text-green-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-amber-800">Ticket Médio</p>
              <h2 className="text-2xl font-bold">R$ {ticketMedio}</h2>
            </div>
            <DollarSign className="text-amber-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-purple-800">Cliente Top</p>
              <h2 className="text-lg font-bold truncate">{clienteTop?.nome || "—"}</h2>
            </div>
            <Trophy className="text-purple-600 w-8 h-8" />
          </CardContent>
        </Card>
      </div>

      {/* === GRÁFICOS === */}
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {/* Pizza */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Distribuição de Clientes por Vendas</CardTitle>
            <CardDescription>Proporção de vendas por cliente.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vendasPorCliente} dataKey="totalVendas" nameKey="nome" outerRadius={90} label>
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
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Ranking de Clientes por Valor Gasto</CardTitle>
            <CardDescription>Top 6 compradores.</CardDescription>
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

        {/* Linha */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Evolução das Vendas</CardTitle>
            <CardDescription>Totais mensais vendidos.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vendasMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <RechartTooltip />
                <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Itens com maior volume de vendas.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={produtosMaisVendidos}>
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                <YAxis />
                <RechartTooltip />
                <Bar dataKey="quantidade" fill="#F59E0B" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* === LISTAGEM DE CLIENTES COM PAGINAÇÃO === */}
      <Card className="shadow-md mt-8">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Gerencie seus clientes.</CardDescription>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClientes.length > 0 ? (
                paginatedClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <ClienteDetalhesModal cliente={cliente}>
                        <Button variant="link" className="p-0 h-auto">
                          {cliente.nome}
                        </Button>
                      </ClienteDetalhesModal>
                    </TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.endereco}</TableCell>
                    <TableCell className="flex gap-2">
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
                          setSelectedCliente(cliente);
                          setIsDeleteModalOpen(true);
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
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
    </div>
  );
};

export default Clientes;
