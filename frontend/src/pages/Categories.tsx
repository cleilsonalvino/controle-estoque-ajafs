import { useState } from "react";
import { Tag, Plus, Edit, Trash2, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  color: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Eletrônicos",
      description: "Smartphones, notebooks, tablets e outros dispositivos eletrônicos",
      productCount: 45,
      color: "bg-blue-500"
    },
    {
      id: "2",
      name: "Móveis",
      description: "Mesas, cadeiras, estantes e móveis para escritório",
      productCount: 23,
      color: "bg-green-500"
    },
    {
      id: "3",
      name: "Roupas",
      description: "Vestuário masculino, feminino e infantil",
      productCount: 67,
      color: "bg-purple-500"
    },
    {
      id: "4",
      name: "Livros",
      description: "Livros técnicos, ficção, educacionais e outros",
      productCount: 128,
      color: "bg-orange-500"
    },
    {
      id: "5",
      name: "Casa e Jardim",
      description: "Utensílios domésticos, ferramentas e produtos para jardim",
      productCount: 34,
      color: "bg-emerald-500"
    },
    {
      id: "6", 
      name: "Esportes",
      description: "Equipamentos esportivos e acessórios para atividades físicas",
      productCount: 19,
      color: "bg-red-500"
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
  });

  const colorOptions = [
    { label: "Azul", value: "bg-blue-500" },
    { label: "Verde", value: "bg-green-500" },
    { label: "Roxo", value: "bg-purple-500" },
    { label: "Laranja", value: "bg-orange-500" },
    { label: "Esmeralda", value: "bg-emerald-500" },
    { label: "Vermelho", value: "bg-red-500" },
    { label: "Rosa", value: "bg-pink-500" },
    { label: "Amarelo", value: "bg-yellow-500" },
    { label: "Indigo", value: "bg-indigo-500" },
    { label: "Teal", value: "bg-teal-500" },
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    if (!formData.name) return;

    const category: Category = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      productCount: 0,
      color: formData.color,
    };

    setCategories([...categories, category]);
    resetForm();
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !formData.name) return;

    const updatedCategory: Category = {
      ...editingCategory,
      name: formData.name,
      description: formData.description,
      color: formData.color,
    };

    setCategories(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
    resetForm();
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "bg-blue-500",
    });
    setShowAddDialog(false);
    setEditingCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
    });
    setShowAddDialog(true);
  };

  const getTotalProducts = () => categories.reduce((sum, cat) => sum + cat.productCount, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Tag className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
              <p className="text-muted-foreground">Organize seus produtos por categorias</p>
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Categorias
            </CardTitle>
            <Tag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{categories.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{getTotalProducts()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Categoria
            </CardTitle>
            <Tag className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {categories.length > 0 ? Math.round(getTotalProducts() / categories.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6 bg-gradient-card border-0 shadow-md">
        <CardContent className="pt-6">
          <Input
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 border bg-gradient-card">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-4 h-4 rounded-full ${category.color}`} />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {category.name}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {category.productCount} produtos
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground line-clamp-3">
                {category.description || "Sem descrição"}
              </div>

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
                  disabled={category.productCount > 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {category.productCount > 0 && (
                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                  * Não é possível excluir categorias com produtos
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
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
                placeholder="Ex: Eletrônicos"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o tipo de produtos desta categoria..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Cor da Categoria</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-10 h-10 rounded-lg ${color.value} border-2 ${
                      formData.color === color.value ? 'border-foreground' : 'border-transparent'
                    } hover:border-foreground/50 transition-colors`}
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button 
              onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
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

export default Categories;