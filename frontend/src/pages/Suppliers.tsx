import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Search,
  Filter,
  FileDown,
  Building2,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSuppliers, Supplier } from "@/contexts/SupplierContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const Suppliers = () => {
  const {
    suppliers,
    loading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSuppliers,
  } = useSuppliers();
  const location = useLocation();

  // === REFRESH AUTOMÁTICO ===
  useEffect(() => {
    const fetchAll = async () => {
      await fetchSuppliers();
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

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<"A-Z" | "Z-A" | "recentes">(
    "recentes"
  );

  const [formData, setFormData] = useState({
    nome: "",
    contato: null,
    email: null,
    telefone: null,
    endereco: null,
  });

  // === Filtros e ordenação ===
  const filteredSuppliers = suppliers
    .filter(
      (s) =>
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contato &&
          s.contato.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOption === "A-Z") return a.nome.localeCompare(b.nome);
      if (sortOption === "Z-A") return b.nome.localeCompare(a.nome);
      return 0;
    });

  // === Exportações ===

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(
      `Relatório de Fornecedores - ${new Date().toLocaleString("pt-BR")}`,
      14,
      15
    );
    autoTable(doc, {
      head: [["Empresa", "Contato", "Email", "Telefone", "Endereço"]],
      body: filteredSuppliers.map((s) => [
        s.nome,
        s.contato,
        s.email,
        s.telefone,
        s.endereco,
      ]),
      startY: 20,
    });
    doc.save("fornecedores.pdf");
  };

  // === CRUD ===
  const handleAdd = () => {
    if (!formData.nome) return;
    createSupplier({
      ...formData,
    });
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingSupplier) return;
    updateSupplier(editingSupplier.id, {
      ...formData,
    });
    resetForm();
  };

  const handleDelete = (id: string, nome: string) => {
    if (nome === "Sem Fornecedor") {
      alert("Este fornecedor não pode ser excluído.");
      return;
    }
    deleteSupplier(id);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      contato: "",
      email: "",
      telefone: "",
      endereco: "",
    });
    setEditingSupplier(null);
    setShowAddDialog(false);
  };

  const openEditDialog = (supplier: Supplier) => {
    if (supplier.nome === "Sem Fornecedor") {
      alert("Este fornecedor não pode ser editado.");
      return;
    }
    setEditingSupplier(supplier);
    setFormData({
      nome: supplier.nome,
      contato: supplier.contato,
      email: supplier.email,
      telefone: supplier.telefone,
      endereco: supplier.endereco,
    });
    setShowAddDialog(true);
  };

  // === Métricas rápidas ===
  const total = suppliers.length;
  const totalEmails = suppliers.filter((s) => s.email).length;
  const totalContatos = suppliers.filter((s) => s.contato).length;

  return (
    <div className="p-6 space-y-6">
      {/* === Header e ações === */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie seus parceiros e contatos comerciais.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportPDF}>
            <FileDown className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* === Cards de estatísticas === */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-green-800">Total de Fornecedores</p>
              <h2 className="text-2xl font-bold">{total}</h2>
            </div>
            <Users className="text-green-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-sky-50 to-sky-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-sky-800">Com Contato</p>
              <h2 className="text-2xl font-bold">{totalContatos}</h2>
            </div>
            <Phone className="text-sky-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-purple-800">Com E-mail</p>
              <h2 className="text-2xl font-bold">{totalEmails}</h2>
            </div>
            <Mail className="text-purple-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-orange-800">Última Atualização</p>
              <h2 className="text-lg font-bold">
                {suppliers[0]?.criadoEm
                  ? new Date(suppliers[0].atualizadoEm).toLocaleDateString(
                      "pt-BR"
                    )
                  : "—"}
              </h2>
            </div>
            <Building2 className="text-orange-600 w-8 h-8" />
          </CardContent>
        </Card>
      </div>

      {/* === Busca e ordenação === */}
      <Card className="bg-gradient-card border-none shadow-md">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="border rounded-md text-sm p-2 focus:outline-none"
            >
              <option value="recentes">Mais recentes</option>
              <option value="A-Z">Ordem A-Z</option>
              <option value="Z-A">Ordem Z-A</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* === Lista de Fornecedores === */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      ) : filteredSuppliers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="border bg-white/70 backdrop-blur-lg hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start text-xs text-muted-foreground">
                  <span>Última Atualização:</span>
                  {supplier.atualizadoEm
                    ? new Date(supplier.atualizadoEm).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : ""}
                </div>

                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold truncate">
                    {supplier.nome}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(supplier)}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Deseja excluir este fornecedor?")) {
                          handleDelete(supplier.id, supplier.nome);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {supplier.contato || "—"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{supplier.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{supplier.telefone || "—"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{supplier.endereco || "Endereço não informado"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border bg-white/70 backdrop-blur-md text-center py-10">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">
            Nenhum fornecedor encontrado
          </h3>
          <p className="text-muted-foreground text-sm">
            {searchTerm
              ? "Tente ajustar os termos de busca."
              : "Cadastre seu primeiro fornecedor."}
          </p>
        </Card>
      )}

      {/* === Modal de Adicionar/Editar === */}
      <Dialog open={showAddDialog} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier
                ? "Atualize as informações do fornecedor."
                : "Preencha os dados do novo fornecedor."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, nome: e.target.value }))
                  }
                  className="border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Contato</Label>
                <Input
                  value={formData.contato}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, contato: e.target.value }))
                  }
                  className="border-gray-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  className="border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, telefone: e.target.value }))
                  }
                  className="border-gray-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={formData.endereco}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, endereco: e.target.value }))
                }
                className="border-gray-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button
              onClick={editingSupplier ? handleUpdate : handleAdd}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {editingSupplier ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
