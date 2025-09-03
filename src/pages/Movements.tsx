import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Plus, Filter, Calendar, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Movement {
  id: string;
  type: "entrada" | "saida";
  product: string;
  quantity: number;
  reason: string;
  date: string;
  user: string;
  notes?: string;
}

const Movements = () => {
  const [movements, setMovements] = useState<Movement[]>([
    {
      id: "1",
      type: "entrada",
      product: "Smartphone Samsung Galaxy",
      quantity: 10,
      reason: "Compra",
      date: "2024-01-15T10:30:00",
      user: "João Silva",
      notes: "Lote 001 - Fornecedor TechStore"
    },
    {
      id: "2",
      type: "saida",
      product: "Notebook Dell Inspiron",
      quantity: 2,
      reason: "Venda",
      date: "2024-01-15T14:22:00",
      user: "Maria Santos",
    },
    {
      id: "3",
      type: "saida",
      product: "Mesa de Escritório",
      quantity: 1,
      reason: "Devolução",
      date: "2024-01-14T16:45:00",
      user: "Carlos Oliveira",
      notes: "Produto com defeito"
    },
    {
      id: "4",
      type: "entrada",
      product: "Cadeira Ergonômica",
      quantity: 5,
      reason: "Compra",
      date: "2024-01-14T09:15:00",
      user: "Ana Costa",
    },
    {
      id: "5",
      type: "saida",
      product: "Teclado Mecânico",
      quantity: 3,
      reason: "Venda",
      date: "2024-01-13T11:30:00",
      user: "Pedro Lima",
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [newMovement, setNewMovement] = useState({
    type: "entrada" as "entrada" | "saida",
    product: "",
    quantity: "",
    reason: "",
    notes: "",
  });

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || movement.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddMovement = () => {
    if (!newMovement.product || !newMovement.quantity) return;

    const movement: Movement = {
      id: Date.now().toString(),
      type: newMovement.type,
      product: newMovement.product,
      quantity: parseInt(newMovement.quantity),
      reason: newMovement.reason || (newMovement.type === "entrada" ? "Compra" : "Venda"),
      date: new Date().toISOString(),
      user: "Usuário Atual",
      notes: newMovement.notes || undefined,
    };

    setMovements([movement, ...movements]);
    setNewMovement({
      type: "entrada",
      product: "",
      quantity: "",
      reason: "",
      notes: "",
    });
    setShowAddDialog(false);
  };

  const getMovementIcon = (type: "entrada" | "saida") => {
    return type === "entrada" ? 
      <ArrowUp className="h-4 w-4 text-success" /> : 
      <ArrowDown className="h-4 w-4 text-destructive" />;
  };

  const getMovementBadge = (type: "entrada" | "saida") => {
    return type === "entrada" ? 
      <Badge variant="success" className="text-xs">Entrada</Badge> :
      <Badge variant="destructive" className="text-xs">Saída</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

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
              <h1 className="text-3xl font-bold text-foreground">Movimentações</h1>
              <p className="text-muted-foreground">Histórico de entradas e saídas de produtos</p>
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

      {/* Filters */}
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
                <SelectItem value="entrada">Apenas entradas</SelectItem>
                <SelectItem value="saida">Apenas saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Movimentações List */}
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
          <div className="space-y-4">
            {filteredMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    {getMovementIcon(movement.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{movement.product}</h4>
                      {getMovementBadge(movement.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Motivo:</span> {movement.reason}
                      {movement.notes && (
                        <>
                          <br />
                          <span className="font-medium">Observações:</span> {movement.notes}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">
                    {movement.type === "entrada" ? "+" : "-"}{movement.quantity}
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

            {filteredMovements.length === 0 && (
              <div className="text-center py-12">
                <ArrowUpDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma movimentação encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== "all" 
                    ? "Tente ajustar os filtros de pesquisa."
                    : "Registre sua primeira movimentação para começar."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Movement Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma nova entrada ou saída de produto do estoque.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Movimentação</Label>
              <Select 
                value={newMovement.type} 
                onValueChange={(value: "entrada" | "saida") => 
                  setNewMovement(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Produto</Label>
              <Input
                placeholder="Nome do produto"
                value={newMovement.product}
                onChange={(e) => setNewMovement(prev => ({ ...prev, product: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                placeholder="Quantidade"
                value={newMovement.quantity}
                onChange={(e) => setNewMovement(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input
                placeholder="Ex: Compra, Venda, Devolução..."
                value={newMovement.reason}
                onChange={(e) => setNewMovement(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Input
                placeholder="Informações adicionais..."
                value={newMovement.notes}
                onChange={(e) => setNewMovement(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMovement} className="bg-gradient-primary hover:opacity-90">
              Registrar Movimentação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Movements;