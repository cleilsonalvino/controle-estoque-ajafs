import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  Edit,
  PlusCircle,
  Trash,
  BarChart2,
  Users,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { AppNavbar } from "@/components/AppSidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useEmpresa } from "@/contexts/EmpresaContext";

// ======================================================
export default function SuperAdminEmpresas() {
  const {
    empresas,
    dashboard,
    loading,
    fetchEmpresas,
    fetchDashboard,
    createEmpresa,
    updateEmpresa,
  } = useEmpresa();

  const [form, setForm] = useState<any>({});
  const [editando, setEditando] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ======================================================
  // 🔹 Carregar dados iniciais
  // ======================================================
  useEffect(() => {
    fetchEmpresas();
    fetchDashboard();
  }, []);

  // ======================================================
  // 🔹 Cadastrar / Editar
  // ======================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await updateEmpresa(form, editando.id);
        toast.success("Empresa atualizada com sucesso!");
      } else {
        await createEmpresa(form);
        toast.success("Empresa cadastrada com sucesso!");
      }
      fetchDashboard();
      setDialogOpen(false);
      setForm({});
      setEditando(null);
    } catch {
      toast.error("Erro ao salvar empresa");
    }
  };

  // ======================================================
  // 🔹 Render
  // ======================================================
  return (
    <div className="container mx-auto p-6 space-y-8">
      <AppNavbar />

      {/* CABEÇALHO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-20"
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          Gestão de Empresas
        </h1>
        <p className="text-muted-foreground">
          Administre, analise e acompanhe todas as empresas do sistema.
        </p>
      </motion.div>

      {/* ======== CARDS DE MÉTRICAS ======== */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Building2 className="text-primary" />
              <CardTitle>Empresas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{dashboard.totalEmpresas}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Users className="text-blue-500" />
              <CardTitle>Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{dashboard.totalUsuarios}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <ShoppingBag className="text-green-500" />
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{dashboard.totalProdutos}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <TrendingUp className="text-amber-500" />
              <CardTitle>Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{dashboard.totalVendas}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======== GRÁFICO DE VENDAS ======== */}
      {dashboard?.vendasMensais?.length ? (
        <Card>
          <CardHeader className="flex items-center gap-2">
            <BarChart2 className="text-primary" />
            <CardTitle>Vendas Mensais por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.vendasMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    `R$ ${value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  }
                />
                <Bar dataKey="total" fill="#3b82f6" name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      {/* ======== RANKING ======== */}
      {dashboard?.topEmpresas?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Ranking das Empresas com Mais Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">#</th>
                  <th className="p-2">Empresa</th>
                  <th className="p-2">Cidade</th>
                  <th className="p-2 text-right">Total de Vendas</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topEmpresas.map((emp, i) => (
                  <tr
                    key={emp.id || i}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-2 font-bold">{i + 1}</td>
                    <td className="p-2">{emp.nome}</td>
                    <td className="p-2">{emp.cidade}</td>
                    <td className="p-2 text-right">
                      R$ {emp.totalVendas?.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {/* ======== BOTÃO NOVA EMPRESA ======== */}
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditando(null); setForm({}); }}>
              <PlusCircle className="h-4 w-4 mr-2" /> Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editando ? "Editar Empresa" : "Cadastrar Nova Empresa"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2">
                <Label>Nome da Empresa*</Label>
                <Input
                  value={form.nome || ""}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>CNPJ*</Label>
                <Input
                  value={form.cnpj || ""}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={form.telefone || ""}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Input
                  value={form.estado || ""}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={form.cidade || ""}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                />
              </div>

              <Button type="submit" disabled={loading} className="col-span-2 mt-4">
                {loading
                  ? "Salvando..."
                  : editando
                  ? "Salvar Alterações"
                  : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ======== LISTA DE EMPRESAS ======== */}
      <section>
        {empresas.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma empresa cadastrada.</p>
        ) : (
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
            {empresas.map((empresa, i) => (
              <motion.div
                key={empresa.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <CardTitle className="text-lg font-semibold mb-2 text-primary">
                      {empresa.nome}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{empresa.cnpj}</p>
                    <p className="text-sm mt-1">{empresa.email}</p>
                    <p className="text-sm">{empresa.telefone}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {empresa.cidade} - {empresa.estado}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Criada em {new Date(empresa.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditando(empresa);
                        setForm(empresa);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => toast.info("Excluir empresa disponível em breve")}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
