
import { useState } from "react";
import { Layers, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useServiceCategories, ServiceCategory } from "@/contexts/ServiceCategoryContext";

const ServiceCategories = () => {
  const { serviceCategories, loading, createServiceCategory, updateServiceCategory, deleteServiceCategory } = useServiceCategories();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
  });

  const filteredCategories = serviceCategories.filter(category =>
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Layers className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Categorias de Serviço</h1>
              <p className="text-muted-foreground">Gerencie as categorias de seus serviços</p>
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
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 border bg-gradient-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-1">
                        {category.nome}
                      </CardTitle>
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
          ))}
        </div>
      )}

      {filteredCategories.length === 0 && !loading && (
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="text-center py-12">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                placeholder="Ex: Manutenção Preventiva"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              />
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

export default ServiceCategories;
