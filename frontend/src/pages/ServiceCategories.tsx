import { useState } from "react";
import { Layers, Plus, Edit, Trash2 } from "lucide-react";
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
import {
  useServiceCategories,
  ServiceCategory,
} from "@/contexts/ServiceCategoryContext";
import { useTiposServicos } from "@/contexts/TiposServicosContext";

const ServiceCategories = () => {
  const {
    serviceCategories,
    loading,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
  } = useServiceCategories();
  const { tiposServicos } = useTiposServicos();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
  });

  const filteredCategories = serviceCategories.filter((category) =>
    category.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    if (!formData.nome) return;
    createServiceCategory(formData);
    resetForm();
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !formData.nome) return;
    updateServiceCategory(editingCategory.id, formData);
    resetForm();
  };

  const handleDeleteCategory = (id: string) => {
    deleteServiceCategory(id);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
    });
    setShowAddDialog(false);
    setEditingCategory(null);
  };

  const openEditDialog = (category: ServiceCategory) => {
    setEditingCategory(category);
    setFormData({
      nome: category.nome,
    });
    setShowAddDialog(true);
  };

  // =====================================
  // 📊 ANALYTICS
  // =====================================
  const totalCategorias = serviceCategories.length;
  const totalServicos = tiposServicos.length;

  const categoriasComServicos = serviceCategories.map((cat) => ({
    nome: cat.nome,
    quantidade: tiposServicos.filter((ts) => ts.categoriaId === cat.id).length,
  }));

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

  const mediaServicos =
    totalCategorias > 0 ? totalServicos / totalCategorias : 0;

  const categoriasOrdenadas = [...categoriasComServicos].sort(
    (a, b) => b.quantidade - a.quantidade
  );

  // =====================================
  // 🚀 RENDER
  // =====================================

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Layers className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Categorias de Serviço
            </h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe as categorias dos seus serviços
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-primary hover:opacity-90 shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Painel Analítico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-none shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">Total de Categorias</p>
            <h2 className="text-2xl font-bold text-blue-700">
              {totalCategorias}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-none shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-green-800">Serviços Cadastrados</p>
            <h2 className="text-2xl font-bold text-green-700">
              {totalServicos}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-none shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-purple-800">
              Média de Serviços por Categoria
            </p>
            <h2 className="text-2xl font-bold text-purple-700">
              {mediaServicos.toFixed(1)}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {/* Gráfico de Pizza */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Distribuição de Serviços por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriasComServicos}
                  dataKey="quantidade"
                  nameKey="nome"
                  outerRadius={90}
                  label
                >
                  {categoriasComServicos.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Ranking de Categorias Mais Utilizadas</CardTitle>
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

      {/* Campo de busca */}
      <Card className="bg-gradient-card border-0 shadow-md mt-6">
        <CardContent className="pt-6">
          <Input
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Lista de categorias */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 border bg-gradient-card">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {category.nome}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {tiposServicos.filter(
                            (ts) => ts.categoriaId === category.id
                          ).length || 0}{" "}
                          serviço(s)
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {filteredCategories.length === 0 && !loading && (
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="text-center py-12">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Tente ajustar os termos de pesquisa."
                : "Adicione sua primeira categoria para começar."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Faça as alterações necessárias na categoria."
                : "Preencha as informações da nova categoria."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Categoria</Label>
              <Input
                placeholder="Ex: Manutenção Preventiva"
                value={formData.nome}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nome: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button
              onClick={
                editingCategory ? handleUpdateCategory : handleAddCategory
              }
              className="bg-gradient-primary hover:opacity-90"
            >
              {editingCategory ? "Salvar Alterações" : "Adicionar Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceCategories;
