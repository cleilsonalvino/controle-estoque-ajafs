import { useState, useMemo } from "react";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  FileDown,
  Loader2,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
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
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useCategories, Category } from "@/contexts/CategoryContext";
import { useProdutos } from "@/contexts/ProdutoContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Categories = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { produtos } = useProdutos();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<"A-Z" | "Z-A" | "recentes">("recentes");

  const [formData, setFormData] = useState({ nome: "", descricao: "" });

  // === FILTRAGEM + ORDENAÇÃO ===
  const filteredCategories = useMemo(() => {
    return categories
      .filter(
        (c) =>
          c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOption === "A-Z") return a.nome.localeCompare(b.nome);
        if (sortOption === "Z-A") return b.nome.localeCompare(a.nome);
        return 0;
      });
  }, [categories, searchTerm, sortOption]);

  // === CRUD ===
  const handleAdd = () => {
    if (!formData.nome) return;
    createCategory({
      ...formData
    });
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingCategory) return;
    updateCategory(editingCategory.id, {
      ...formData,
      criadoEm: editingCategory.criadoEm,
      atualizadoEm: new Date(),
    });
    resetForm();
  };

  const handleDelete = (id: string, nome: string) => {
    if (nome === "Sem Categoria") {
      alert("Não é possível excluir esta categoria padrão.");
      return;
    }
    deleteCategory(id);
  };

  const resetForm = () => {
    setFormData({ nome: "", descricao: "" });
    setEditingCategory(null);
    setShowAddDialog(false);
  };

  const openEditDialog = (category: Category) => {
    if (category.nome === "Sem Categoria") {
      alert("Não é possível editar esta categoria.");
      return;
    }
    setEditingCategory(category);
    setFormData({ nome: category.nome, descricao: category.descricao });
    setShowAddDialog(true);
  };

  // === EXPORTAÇÃO ===
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredCategories.map((c) => ({
        Categoria: c.nome,
        Descrição: c.descricao,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categorias");
    XLSX.writeFile(wb, "categorias.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Categorias", 14, 15);
    autoTable(doc, {
      head: [["Categoria", "Descrição"]],
      body: filteredCategories.map((c) => [c.nome, c.descricao || "—"]),
      startY: 20,
    });
    doc.save("categorias.pdf");
  };

  // === MÉTRICAS ===
  const totalCategorias = categories.length;
  const totalProdutos = produtos.length;
  const ultimaAtualizacao = categories[0]
    ? new Date(categories[0].criadoEm || Date.now()).toLocaleDateString("pt-BR")
    : "—";

  // === GRÁFICOS ===
  const categoriasComProdutos = categories.map((cat) => ({
    nome: cat.nome,
    quantidade: produtos.filter((p) => p.categoria?.id === cat.id).length,
  }));

  const totalProdutosPorCategoria = categoriasComProdutos.reduce((acc, c) => acc + c.quantidade, 0);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9"];

  const categoriasOrdenadas = [...categoriasComProdutos]
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      {/* === HEADER === */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Visualize suas categorias e acompanhe a quantidade de produtos vinculados.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportExcel}>
            <FileDown className="h-4 w-4 mr-2" /> Excel
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            <FileDown className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Nova Categoria
          </Button>
        </div>
      </div>

      {/* === CARDS DE ESTATÍSTICAS === */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-sky-50 to-sky-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-sky-800">Total de Categorias</p>
              <h2 className="text-2xl font-bold">{totalCategorias}</h2>
            </div>
            <Layers className="text-sky-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-green-800">Total de Produtos</p>
              <h2 className="text-2xl font-bold">{totalProdutos}</h2>
            </div>
            <Tag className="text-green-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-orange-800">Última Atualização</p>
              <h2 className="text-lg font-bold">{ultimaAtualizacao}</h2>
            </div>
            <Filter className="text-orange-600 w-8 h-8" />
          </CardContent>
        </Card>
      </div>

      {/* === GRÁFICOS === */}
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {/* Pizza */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Distribuição de Produtos por Categoria</CardTitle>
            <CardDescription>
              Visualize a proporção de produtos em cada categoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriasComProdutos}
                  dataKey="quantidade"
                  nameKey="nome"
                  outerRadius={90}
                  label
                >
                  {categoriasComProdutos.map((_, i) => (
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
            <CardTitle>Ranking de Categorias com Mais Produtos</CardTitle>
            <CardDescription>
              As categorias mais populares com base no número de produtos.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoriasOrdenadas}
                layout="vertical"
                margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={150} />
                <RechartTooltip />
                <Bar dataKey="quantidade" fill="#3B82F6" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* === BUSCA E FILTRO === */}
      <Card className="bg-gradient-card border-none shadow-md">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorias..."
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

      {/* === LISTAGEM === */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category, i) => {
            const qtd = produtos.filter((p) => p.categoria?.id === category.id).length;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border bg-white/70 backdrop-blur-lg hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold truncate">
                        {category.nome}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id, category.nome)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground truncate">
                      {category.descricao || "Sem descrição"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-sky-700">
                      Produtos vinculados: {qtd}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border bg-white/70 backdrop-blur-md text-center py-10">
          <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">Nenhuma categoria encontrada</h3>
          <p className="text-muted-foreground text-sm">
            {searchTerm ? "Tente ajustar os termos de busca." : "Cadastre sua primeira categoria."}
          </p>
        </Card>
      )}

      {/* === MODAL === */}
      <Dialog open={showAddDialog} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Atualize as informações da categoria."
                : "Preencha os dados da nova categoria."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Eletrônicos"
                value={formData.nome}
                onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o tipo de produtos desta categoria..."
                value={formData.descricao}
                onChange={(e) => setFormData((p) => ({ ...p, descricao: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button
              onClick={editingCategory ? handleUpdate : handleAdd}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {editingCategory ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
