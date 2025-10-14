import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Plus,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

interface Movement {
  id: string;
  type: "ENTRADA" | "SAIDA";
  product: string;
  quantity: number;
  reason: string;
  date: string;
  user: string;
  notes?: string;
}

const Movements = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [newMovement, setNewMovement] = useState({
    type: "ENTRADA" as "ENTRADA" | "SAIDA",
    product: "",
    quantity: "",
    reason: "",
    notes: "",
  });

  // =============================
  // 🔹 Buscar movimentações reais
  // =============================
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        const response = await api.get("/estoque/movimentacoes");

        const data = response.data;

        // adapta os campos do back para o formato do front
        const formatted: Movement[] = data.map((item: any) => ({
          id: item.id,
          type: item.tipo,
          product: item.produto?.nome || "Produto não encontrado", // Assuming item.produto.nome exists
          quantity: Number(item.quantidade),
          reason: item.tipo || "Sem motivo",
          date: item.criadoEm,
          user: "Usuário do sistema", // se o backend enviar, substitua por item.usuario.nome
          notes: item.observacao || "",
        }));

        // ordena por data (mais recente primeiro)
        formatted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setMovements(formatted);
      } catch (error) {
        console.error("Erro ao buscar movimentações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  // =============================
  // 🔹 Filtragem e busca
  // =============================
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || movement.type === filterType;
    return matchesSearch && matchesType;
  });

  // =============================
  // 🔹 Adicionar movimentação (apenas local)
  // =============================
  const [products, setProducts] = useState([]);

  // Carrega produtos ao abrir o modal
  useEffect(() => {
    if (!showAddDialog) return;
    const fetchProducts = async () => {
      try {
        const response = await api.get("/produtos");
        setProducts(response.data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast.error("Erro ao carregar lista de produtos");
      }
    };
    fetchProducts();
  }, [showAddDialog]);

  const handleAddMovement = async () => {
    if (!newMovement.product || !newMovement.quantity) {
      toast.warning("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      await api.post("/estoque/movimentacao", {
        produtoId: newMovement.product,
        tipo: newMovement.type.toUpperCase(), // "ENTRADA" | "SAIDA"
        quantidade: Number(newMovement.quantity),
        observacao: newMovement.notes || "Movimentação manual",
      });

      toast.success("Movimentação registrada com sucesso!");
      setShowAddDialog(false);
      setNewMovement({
        type: "ENTRADA",
        product: "",
        quantity: "",
        notes: "",
        reason: "",
      });

      // Atualiza a lista de movimentações na tela principal
      onMovementAdded();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar movimentação");
    }
  };

  // =============================
  // 🔹 Utilitários visuais
  // =============================
  const getMovementIcon = (type: "ENTRADA" | "SAIDA") => {
    return type === "ENTRADA" ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    );
  };

const getMovementBadge = (type: "ENTRADA" | "SAIDA" | "AJUSTE") => {
  if (type === "ENTRADA") {
    return <Badge className="text-xs bg-green-600 text-white">Entrada</Badge>;
  } else if (type === "SAIDA") {
    return <Badge className="text-xs bg-red-600 text-white">Saída</Badge>;
  } else if (type === "AJUSTE") {
    return <Badge className="text-xs bg-yellow-600 text-white">Ajuste</Badge>;
  }

  // fallback opcional, caso venha um tipo inesperado
  return <Badge className="text-xs bg-gray-600 text-white">Desconhecido</Badge>;
};



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR");
  };

  // =============================
  // 🔹 Renderização
  // =============================
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <ArrowUpDown className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Movimentações
              </h1>
              <p className="text-muted-foreground">
                Histórico de entradas e saídas de produtos
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6 bg-gradient-card border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por produto ou motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="ENTRADA">Apenas entradas</SelectItem>
                <SelectItem value="SAIDA">Apenas saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de movimentações */}
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Histórico de Movimentações ({filteredMovements.length})
          </CardTitle>
          <CardDescription>
            Registro detalhado de todas as movimentações de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-10">
              Carregando movimentações...
            </p>
          ) : filteredMovements.length > 0 ? (
            <div className="space-y-4">
              {filteredMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {getMovementIcon(movement.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {movement.product}
                        </h4>
                        {getMovementBadge(movement.type)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Motivo:</span>{" "}
                        {movement.reason}
                        {movement.notes && (
                          <>
                            <br />
                            <span className="font-medium">Obs:</span>{" "}
                            {movement.notes}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {movement.type === "ENTRADA" ? "+" : "-"}
                      {movement.quantity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(movement.date)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      por {movement.user}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ArrowUpDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma movimentação encontrada
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== "all"
                  ? "Tente ajustar os filtros de pesquisa."
                  : "Registre sua primeira movimentação para começar."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de nova movimentação */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma nova entrada ou saída manual de produto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label>Tipo de Movimentação</Label>
              <Select // Changed from "entrada" | "saida" to "ENTRADA" | "SAIDA"
                value={newMovement.type} // Changed from "entrada" | "saida" to "ENTRADA" | "SAIDA"
                onValueChange={(value: "ENTRADA" | "SAIDA") =>
                  setNewMovement((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SAIDA">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Produto */}
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select
                value={newMovement.product}
                onValueChange={(value) =>
                  setNewMovement((prev) => ({ ...prev, product: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantidade */}
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                placeholder="Quantidade"
                value={newMovement.quantity}
                onChange={(e) =>
                  setNewMovement((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Movimentação</Label>
              <Select
                value={newMovement.type} // Changed from "entrada" | "saida" to "ENTRADA" | "SAIDA"
                onValueChange={(value: "ENTRADA" | "SAIDA") =>
                  setNewMovement((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SAIDA">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <Label>Observação (opcional)</Label>
              <Input
                placeholder="Ex: ajuste, devolução..."
                value={newMovement.notes}
                onChange={(e) =>
                  setNewMovement((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddMovement}
              className="bg-gradient-primary hover:opacity-90"
            >
              Registrar Movimentação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Movements;
function onMovementAdded() {
  throw new Error("Function not implemented.");
}
