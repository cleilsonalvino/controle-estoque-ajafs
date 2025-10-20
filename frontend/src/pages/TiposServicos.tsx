import { useState } from "react";
import { Wrench, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTiposServicos, TipoServico } from "@/contexts/TiposServicosContext";
import { useServiceCategories } from "@/contexts/ServiceCategoryContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TiposServicos = () => {
  const { tiposServicos, loading, createTipoServico, updateTipoServico, deleteTipoServico } = useTiposServicos();
  const { serviceCategories } = useServiceCategories();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTipoServico, setEditingTipoServico] = useState<TipoServico | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    precoCusto: 0.0,
    precoVenda: 0.0,
    duracaoMinutos: 0,
    categoriaId: "",
  });

  const filteredTiposServicos = tiposServicos.filter(tipoServico =>
    tipoServico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipoServico.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTipoServico = () => {
    if (!formData.nome) return;
    createTipoServico({
      ...formData,
      precoCusto: Number(formData.precoCusto) || 0,
      precoVenda: Number(formData.precoVenda) || 0,
      duracaoMinutos: Number(formData.duracaoMinutos) || 0,
    });
    resetForm();
  };

  const handleUpdateTipoServico = () => {
    if (!editingTipoServico || !formData.nome) return;
    updateTipoServico(editingTipoServico.id, {
      ...formData,
      precoCusto: Number(formData.precoCusto) || 0,
      precoVenda: Number(formData.precoVenda) || 0,
      duracaoMinutos: Number(formData.duracaoMinutos) || 0,
    });
    resetForm();
  };

  const handleDeleteTipoServico = (id: string) => {
    deleteTipoServico(id);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      precoCusto: 0.0,
      precoVenda: 0.0,
      duracaoMinutos: 0,
      categoriaId: "",
    });
    setShowAddDialog(false);
    setEditingTipoServico(null);
  };

  const openEditDialog = (tipoServico: TipoServico) => {
    setEditingTipoServico(tipoServico);
    setFormData({
      nome: tipoServico.nome,
      descricao: tipoServico.descricao,
      precoCusto: tipoServico.precoCusto ?? 0,
      precoVenda: tipoServico.precoVenda ?? 0,
      duracaoMinutos: tipoServico.duracaoMinutos ?? 0,
      categoriaId: tipoServico.categoriaId || "",
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
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tipos de Serviços</h1>
              <p className="text-muted-foreground">Gerencie os tipos de serviços oferecidos</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo de Serviço
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6 bg-gradient-card border-0 shadow-md">
        <CardContent className="pt-6">
          <Input
            placeholder="Buscar tipos de serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Tipos de Serviços Grid */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTiposServicos.map((tipoServico) => (
            <Card key={tipoServico.id} className="group hover:shadow-lg transition-all duration-300 border bg-gradient-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-1">
                        {tipoServico.nome}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {tipoServico.descricao || "Sem descrição"}
                </div>
                <div className="text-sm text-red-600 line-clamp-3">
                  Preço de Custo: {tipoServico.precoCusto || "Sem preço de custo"}
                </div>
                <div className="text-sm text-green-500 line-clamp-3">
                  Preço de Venda: {tipoServico.precoVenda || "Sem preço de venda"}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(tipoServico)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTipoServico(tipoServico.id)}
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

      {filteredTiposServicos.length === 0 && !loading && (
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="text-center py-12">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum tipo de serviço encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Tente ajustar os termos de pesquisa."
                : "Adicione seu primeiro tipo de serviço para começar."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Tipo de Serviço Dialog */}
      <Dialog open={showAddDialog} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTipoServico ? "Editar Tipo de Serviço" : "Novo Tipo de Serviço"}
            </DialogTitle>
            <DialogDescription>
              {editingTipoServico 
                ? "Faça as alterações necessárias no tipo de serviço."
                : "Preencha as informações do novo tipo de serviço."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Tipo de Serviço</Label>
              <Input
                placeholder="Ex: Manutenção de Computadores"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o tipo de serviço..."
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço de Custo</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.precoCusto}
                  onChange={(e) => setFormData(prev => ({ ...prev, precoCusto: Number(e.target.value) }))}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Venda</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step={0.1}
                  value={formData.precoVenda}
                  onChange={(e) => setFormData(prev => ({ ...prev, precoVenda: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duração (minutos)</Label>
              <Input
                type="number"
                placeholder="60"
                value={formData.duracaoMinutos}
                onChange={(e) => setFormData(prev => ({ ...prev, duracaoMinutos: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formData.categoriaId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoriaId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button 
              onClick={editingTipoServico ? handleUpdateTipoServico : handleAddTipoServico}
              className="bg-gradient-primary hover:opacity-90"
            >
              {editingTipoServico ? "Salvar Alterações" : "Adicionar Tipo de Serviço"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TiposServicos;
