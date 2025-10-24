import { useState } from "react";
import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  FileDown,
  Loader2,
  Search,
  Clock,
  DollarSign,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useTiposServicos, TipoServico } from "@/contexts/TiposServicosContext";
import { useServiceCategories } from "@/contexts/ServiceCategoryContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TiposServicos = () => {
  const { tiposServicos, loading, createTipoServico, updateTipoServico, deleteTipoServico } =
    useTiposServicos();
  const { serviceCategories } = useServiceCategories();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTipoServico, setEditingTipoServico] = useState<TipoServico | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<"A-Z" | "Z-A" | "recentes">("recentes");

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    precoCusto: 0.0,
    precoVenda: 0.0,
    duracaoMinutos: 0,
    categoriaId: "",
  });

  // === FILTRAGEM E ORDENAÇÃO ===
  const filteredTiposServicos = tiposServicos
    .filter(
      (s) =>
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "A-Z") return a.nome.localeCompare(b.nome);
      if (sortOption === "Z-A") return b.nome.localeCompare(a.nome);
      return 0;
    });

  // === CRUD ===
  const handleAdd = () => {
    if (!formData.nome) return;
    createTipoServico({
      ...formData,
      precoCusto: Number(formData.precoCusto),
      precoVenda: Number(formData.precoVenda),
      duracaoMinutos: Number(formData.duracaoMinutos),
    });
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingTipoServico) return;
    updateTipoServico(editingTipoServico.id, {
      ...formData,
      precoCusto: Number(formData.precoCusto),
      precoVenda: Number(formData.precoVenda),
      duracaoMinutos: Number(formData.duracaoMinutos),
    });
    resetForm();
  };

  const handleDelete = (id: string) => {
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
    setEditingTipoServico(null);
    setShowAddDialog(false);
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

  // === EXPORTAÇÃO ===
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredTiposServicos.map((s) => ({
        Serviço: s.nome,
        Descrição: s.descricao,
        "Preço de Custo": s.precoCusto,
        "Preço de Venda": s.precoVenda,
        "Duração (min)": s.duracaoMinutos,
        Categoria: serviceCategories.find((c) => c.id === s.categoriaId)?.nome || "—",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Serviços");
    XLSX.writeFile(wb, "tipos_de_servicos.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Tipos de Serviços", 14, 15);
    autoTable(doc, {
      head: [["Serviço", "Descrição", "Custo", "Venda", "Duração", "Categoria"]],
      body: filteredTiposServicos.map((s) => [
        s.nome,
        s.descricao,
        s.precoCusto,
        s.precoVenda,
        s.duracaoMinutos,
        serviceCategories.find((c) => c.id === s.categoriaId)?.nome || "—",
      ]),
      startY: 20,
    });
    doc.save("tipos_de_servicos.pdf");
  };

  // === MÉTRICAS ===
  const totalServicos = tiposServicos.length;
  const mediaPrecoVenda =
    tiposServicos.reduce((acc, s) => acc + (s.precoVenda || 0), 0) /
    (tiposServicos.length || 1);
  const mediaDuracao =
    tiposServicos.reduce((acc, s) => acc + (s.duracaoMinutos || 0), 0) /
    (tiposServicos.length || 1);

  return (
    <div className="p-6 space-y-6">
      {/* === HEADER === */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tipos de Serviços</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os serviços oferecidos pela sua empresa.
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
            <Plus className="h-4 w-4 mr-2" /> Novo Serviço
          </Button>
        </div>
      </div>

      {/* === MÉTRICAS === */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-blue-800">Total de Serviços</p>
              <h2 className="text-2xl font-bold">{totalServicos}</h2>
            </div>
            <Layers className="text-blue-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-green-800">Média de Preço de Serviço</p>
              <h2 className="text-2xl font-bold">R$ {mediaPrecoVenda.toFixed(2)}</h2>
            </div>
            <DollarSign className="text-green-600 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-none shadow-sm">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-orange-800">Duração Média</p>
              <h2 className="text-2xl font-bold">{mediaDuracao.toFixed(0)} min</h2>
            </div>
            <Clock className="text-orange-600 w-8 h-8" />
          </CardContent>
        </Card>
      </div>

      {/* === BUSCA E FILTRO === */}
      <Card className="bg-gradient-card border-none shadow-md">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="border rounded-md text-sm p-2"
          >
            <option value="recentes">Mais recentes</option>
            <option value="A-Z">Ordem A-Z</option>
            <option value="Z-A">Ordem Z-A</option>
          </select>
        </CardContent>
      </Card>

      {/* === LISTA DE SERVIÇOS === */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTiposServicos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTiposServicos.map((s) => (
            <Card
              key={s.id}
              className="border bg-white/70 backdrop-blur-md hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold truncate">{s.nome}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(s)}>
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {s.descricao || "Sem descrição"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-green-600 font-semibold">
                  Preço Venda: R$ "—"
                </p>
                <p className="text-sm text-red-500">
                  Custo: R$ "—"
                </p>
                <p className="text-xs text-muted-foreground">
                  Duração: {s.duracaoMinutos || "—"} min
                </p>
                <p className="text-xs text-muted-foreground">
                  Categoria:{" "}
                  {serviceCategories.find((c) => c.id === s.categoriaId)?.nome || "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border bg-white/70 backdrop-blur-md text-center py-10">
          <Wrench className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">Nenhum serviço encontrado</h3>
          <p className="text-muted-foreground text-sm">
            {searchTerm
              ? "Tente ajustar os termos de busca."
              : "Adicione o primeiro tipo de serviço."}
          </p>
        </Card>
      )}

      {/* === MODAL === */}
      <Dialog open={showAddDialog} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTipoServico ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
            <DialogDescription>
              {editingTipoServico
                ? "Atualize as informações do serviço."
                : "Preencha os detalhes do novo serviço."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Manutenção de Computadores"
                value={formData.nome}
                onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o serviço..."
                value={formData.descricao}
                onChange={(e) => setFormData((p) => ({ ...p, descricao: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço de Custo</Label>
                <Input
                  type="number"
                  value={formData.precoCusto}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, precoCusto: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Venda</Label>
                <Input
                  type="number"
                  value={formData.precoVenda}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, precoVenda: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duração (minutos)</Label>
              <Input
                type="number"
                value={formData.duracaoMinutos}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, duracaoMinutos: Number(e.target.value) }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={(value) => setFormData((p) => ({ ...p, categoriaId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button
              onClick={editingTipoServico ? handleUpdate : handleAdd}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {editingTipoServico ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TiposServicos;
