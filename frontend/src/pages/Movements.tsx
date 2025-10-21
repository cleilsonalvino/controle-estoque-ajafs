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
  type: "ENTRADA" | "SAIDA" | "AJUSTE";
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
    type: "ENTRADA" as "ENTRADA" | "AJUSTE" | "SAIDA",
    product: "",
    quantity: "",
    reason: "",
    notes: "",
    fornecedorId: "",
    precoCusto: "",
    validade: "",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // =============================
  // 🔹 Buscar movimentações reais
  // =============================
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        const response = await api.get("/estoque/movimentacoes");
        const data = response.data;

        const formatted: Movement[] = data.map((item: any) => ({
          id: item.id,
          type: item.tipo,
          product: item.produto?.nome || "Produto não encontrado",
          quantity: Number(item.quantidade),
          reason: item.tipo || "Sem motivo",
          date: item.criadoEm,
          user: item.usuario?.nome || "Usuário do sistema",
          notes: item.observacao || "",
        }));

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
  // 🔹 Carrega produtos e fornecedores ao abrir o modal
  // =============================
  useEffect(() => {
    if (!showAddDialog) return;
    const fetchData = async () => {
      try {
        const [prodResp, fornResp] = await Promise.all([
          api.get("/produtos"),
          api.get("/fornecedores"),
        ]);
        setProducts(prodResp.data);
        setSuppliers(fornResp.data);
      } catch (error) {
        console.error("Erro ao carregar produtos/fornecedores:", error);
        toast.error("Erro ao carregar dados de produtos e fornecedores");
      }
    };
    fetchData();
  }, [showAddDialog]);

  // =============================
  // 🔹 Adicionar movimentação + criação de lote (entrada)
  // =============================
  const handleAddMovement = async () => {
    if (!newMovement.product || !newMovement.quantity) {
      toast.warning("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const payload = {
        produtoId: newMovement.product,
        tipo: newMovement.type.toUpperCase(),
        quantidade: Number(newMovement.quantity),
        observacao: newMovement.notes || "Movimentação manual",
        fornecedorId:
          newMovement.type === "ENTRADA" ? newMovement.fornecedorId || null : null,
        precoCusto:
          newMovement.type === "ENTRADA" && newMovement.precoCusto
            ? Number(newMovement.precoCusto)
            : null,
        validade:
          newMovement.type === "ENTRADA" && newMovement.validade
            ? newMovement.validade
            : null,
      };
      console.log(payload);

      await api.post("/estoque/movimentacao", payload);

      toast.success(
        newMovement.type === "ENTRADA"
          ? "Entrada registrada e lote criado!"
          : "Movimentação registrada com sucesso!"
      );
      setShowAddDialog(false);
      setNewMovement({
        type: "ENTRADA",
        product: "",
        quantity: "",
        notes: "",
        reason: "",
        fornecedorId: "",
        precoCusto: "",
        validade: "",
      });
      // Atualiza lista local
      onMovementAdded();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar movimentação");
    }
  };

  const onMovementAdded = async () => {
    const response = await api.get("/estoque/movimentacoes");
    setMovements(response.data);
  };

  // =============================
  // 🔹 Utilitários visuais
  // =============================
  const getMovementIcon = (type: "ENTRADA" | "SAIDA" | "AJUSTE") =>
    type === "ENTRADA" ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    );

  const getMovementBadge = (type: "ENTRADA" | "SAIDA" | "AJUSTE") => {
    const map = {
      ENTRADA: "bg-green-600",
      SAIDA: "bg-red-600",
      AJUSTE: "bg-yellow-600",
    };
    return (
      <Badge className={`text-xs text-white ${map[type] || "bg-gray-600"}`}>
        {type.charAt(0) + type.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("pt-BR");

  // =============================
  // 🔹 Renderização
  // =============================
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <ArrowUpDown className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Movimentações</h1>
            <p className="text-muted-foreground">
              Entradas, saídas e criação de lotes
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

      {/* Filtros */}
      <Card className="mb-6 bg-gradient-card border-0 shadow-md">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto ou motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ENTRADA">Entradas</SelectItem>
              <SelectItem value="SAIDA">Saídas</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Histórico de Movimentações ({filteredMovements.length})
          </CardTitle>
          <CardDescription>
            Registro de entradas, saídas e lotes criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-10">
              Carregando movimentações...
            </p>
          ) : filteredMovements.length > 0 ? (
            <div className="space-y-4">
              {filteredMovements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {getMovementIcon(m.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{m.product}</h4>
                        {getMovementBadge(m.type)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {m.reason} — {m.notes}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {m.type === "ENTRADA" ? "+" : "-"}
                      {m.quantity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(m.date)} <br /> {m.user}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">
              Nenhuma movimentação encontrada.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma entrada (cria lote) ou saída manual.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={newMovement.type}
                onValueChange={(value: "ENTRADA" | "SAIDA") =>
                  setNewMovement((p) => ({ ...p, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada (cria lote)</SelectItem>
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
                  setNewMovement((p) => ({ ...p, product: value }))
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

            {/* Fornecedor e Preço de Custo (apenas se ENTRADA) */}
            {newMovement.type === "ENTRADA" && (
              <>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Select
                    value={newMovement.fornecedorId}
                    onValueChange={(value) =>
                      setNewMovement((p) => ({ ...p, fornecedorId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preço de Custo (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newMovement.precoCusto}
                    onChange={(e) =>
                      setNewMovement((p) => ({
                        ...p,
                        precoCusto: e.target.value,
                      }))
                    }
                    placeholder="Ex: 12.50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Validade (opcional)</Label>
                  <Input
                    type="date"
                    value={newMovement.validade}
                    onChange={(e) =>
                      setNewMovement((p) => ({
                        ...p,
                        validade: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            {/* Quantidade */}
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                value={newMovement.quantity}
                onChange={(e) =>
                  setNewMovement((p) => ({ ...p, quantity: e.target.value }))
                }
                placeholder="Informe a quantidade"
              />
            </div> 

            {/* Observação */}
            <div className="space-y-2">
              <Label>Observação (opcional)</Label>
              <Input
                placeholder="Ex: devolução, ajuste..."
                value={newMovement.notes}
                onChange={(e) =>
                  setNewMovement((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddMovement}
              className="bg-gradient-primary hover:opacity-90"
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Movements;
