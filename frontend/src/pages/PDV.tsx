// src/pages/PDV.tsx

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
// ✅ NOVO: Importar useNavigate para a navegação
import { useNavigate } from "react-router-dom";
import {
  X,
  Search,
  User,
  Tag,
  DollarSign,
  Trash2,
  Maximize,
  Minimize,
  Coins,
  PlusCircle,
  Loader2,
  FileWarning, // ✅ NOVO: Ícone para o modal
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SaleItem } from "@/contexts/SalesContext";
import { Produto, useProdutos } from "@/contexts/ProdutoContext";
import { Cliente, useClientes } from "@/contexts/ClienteContext";
import { Vendedor } from "@/contexts/VendedorContext";

// ... (Tipos FinalizeSaleData e PDVProps permanecem os mesmos)
type FinalizeSaleData = {
  saleItems: SaleItem[];
  clienteId?: string;
  vendedorId: string;
  desconto: number;
  formaPagamento: string;
  total: number;
};

interface PDVProps {
  clientes: Cliente[];
  vendedores: Vendedor[];
  onFinalizeSale: (saleData: FinalizeSaleData) => Promise<boolean>;
  onExit: () => void;
}

const PAYMENT_METHODS = [
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Pix", label: "Pix" },
  { value: "Debito", label: "Cartão de Débito" },
  { value: "Credito", label: "Cartão de Crédito" },
];

// ============================================================================
// 🦁 Custom Hook: usePdv
// ============================================================================
// 🔄 ALTERADO: Hook agora recebe um callback para quando o estoque for zero
const usePdv = (
  onFinalizeSale: PDVProps["onFinalizeSale"],
  estoques: Record<string, number>,
  onZeroStock: (produto: Produto) => void
) => {
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { createCliente } = useClientes();

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  // ... (outros estados do hook permanecem os mesmos)
  const [selectedCliente, setSelectedCliente] = useState<string | null>();
  const [selectedVendedor, setSelectedVendedor] = useState<
    string | undefined
  >();
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>();
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null
  );
  const [lastAddedProduct, setLastAddedProduct] = useState<Produto | null>(
    null
  );
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

  const subtotal = useMemo(
    () =>
      saleItems.reduce((acc, item) => acc + item.precoVenda * item.quantity, 0),
    [saleItems]
  );
  const total = useMemo(
    () => subtotal - (subtotal * discount) / 100,
    [subtotal, discount]
  );
  const change = useMemo(
    () =>
      paymentMethod === "Dinheiro" && amountPaid > total
        ? amountPaid - total
        : 0,
    [amountPaid, total, paymentMethod]
  );

  // ... (useEffect de carregar e salvar no localStorage permanece o mesmo)
  useEffect(() => {
    const saved = localStorage.getItem("pdv_cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSaleItems(parsed);
      } catch (err) {
        console.error("Erro ao restaurar carrinho:", err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pdv_cart", JSON.stringify(saleItems));
  }, [saleItems]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(query) ||
        p.codigoBarras?.toLowerCase().includes(query)
    );
  }, [searchQuery, produtos]);

  // 🔄 ALTERADO: Adiciona a verificação de estoque antes de qualquer ação
  const addItemToSale = useCallback(
    (produto: Produto) => {
      const estoqueDisponivel = estoques[produto.id];

      // Se o estoque é zero, não faz nada e chama o callback para abrir o modal
      if (estoqueDisponivel === 0) {
        onZeroStock(produto);
        return;
      }

      setSaleItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === produto.id);

        if (existingItem) {
          // Impede de adicionar mais que o estoque
          if (
            estoqueDisponivel !== undefined &&
            existingItem.quantity >= estoqueDisponivel
          ) {
            toast.error(`Estoque máximo atingido para ${produto.nome}.`);
            return prevItems; // Retorna o estado anterior sem alteração
          }
          return prevItems.map((item) =>
            item.id === produto.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        // Se é um item novo
        return [
          ...prevItems,
          {
            id: produto.id,
            produto,
            precoVenda: parseFloat(produto.precoVenda),
            precoCusto: produto.lote?.[0]?.precoCusto || 0,
            quantity: 1,
            type: "SAIDA",
          },
        ];
      });

      setLastAddedProduct(produto);
      setSearchQuery("");
      setHighlightedItemId(produto.id);
      setTimeout(() => setHighlightedItemId(null), 600);
    },
    [estoques, onZeroStock] // Adicionadas as novas dependências
  );

  // ... (O resto do hook permanece o mesmo: updateItemQuantity, resetSale, clearCart, handleFinalize, etc.)
  const updateItemQuantity = useCallback(
    (id: string, newQuantity: number) => {
      const itemToUpdate = saleItems.find((item) => item.id === id);
      if (!itemToUpdate) return;

      const estoqueDisponivel = estoques[itemToUpdate.produto.id];

      if (estoqueDisponivel !== undefined && newQuantity > estoqueDisponivel) {
        toast.error(
          `Estoque insuficiente. Apenas ${estoqueDisponivel} unidades disponíveis.`
        );
        return;
      }

      setSaleItems((prev) =>
        newQuantity <= 0
          ? prev.filter((item) => item.id !== id)
          : prev.map((item) =>
              item.id === id ? { ...item, quantity: newQuantity } : item
            )
      );
    },
    [saleItems, estoques]
  );

  const resetSale = useCallback(() => {
    setSaleItems([]);
    setSelectedCliente(undefined);
    setSelectedVendedor(undefined);
    setDiscount(0);
    setPaymentMethod(undefined);
    setIsPaymentDialogOpen(false);
    setLastAddedProduct(null);
    setAmountPaid(0);
    setSearchQuery("");
  }, []);

  const clearCart = useCallback(() => {
    setSaleItems([]);
    localStorage.removeItem("pdv_cart");
    toast.info("Carrinho esvaziado com sucesso!");
  }, []);

  const handleFinalize = async () => {
    if (!selectedVendedor || !paymentMethod) {
      toast.error("Vendedor, Forma de Pagamento e Cliente são obrigatórios.");
      return;
    }

    try {
      const success = await onFinalizeSale({
        saleItems,
        clienteId: selectedCliente || null,
        vendedorId: selectedVendedor,
        desconto: discount,
        formaPagamento: paymentMethod,
        total,
      });

      if (success) {
        toast.success("Venda finalizada com sucesso!");
        toast.info("Estoque dos produtos foi atualizado.");

        resetSale();
      }
    } catch (err: any) {
      console.error("Erro ao criar venda:", err);
      toast.error(err.response?.data?.message || "Erro ao processar a venda.");
    }
  };

  const handleSaveCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast.error("O nome do cliente é obrigatório.");
      return;
    }
    const promise = createCliente({ nome: newCustomerName.trim() });
    toast.promise(promise, {
      loading: "Salvando novo cliente...",
      success: (newCustomer) => {
        if (newCustomer?.id) {
          setSelectedCliente(newCustomer.id);
          setIsNewCustomerDialogOpen(false);
          setNewCustomerName("");
          return "Cliente cadastrado e selecionado!";
        }
        throw new Error("API não retornou um cliente válido.");
      },
      error: "Erro ao cadastrar o cliente.",
    });
  };

  return {
    saleItems,
    selectedCliente,
    setSelectedCliente,
    selectedVendedor,
    setSelectedVendedor,
    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    amountPaid,
    setAmountPaid,
    searchQuery,
    setSearchQuery,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    highlightedItemId,
    lastAddedProduct,
    isNewCustomerDialogOpen,
    setIsNewCustomerDialogOpen,
    newCustomerName,
    setNewCustomerName,
    loadingProdutos,
    subtotal,
    total,
    change,
    filteredProducts,
    addItemToSale,
    updateItemQuantity,
    handleFinalize,
    handleSaveCustomer,
    clearCart,
  };
};

// ============================================================================
// 🎨 Componente de UI: PDV
// ============================================================================
const PDV = ({ clientes, vendedores, onFinalizeSale, onExit }: PDVProps) => {
  const navigate = useNavigate(); // ✅ NOVO: Hook para navegação
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [estoques, setEstoques] = useState<Record<string, number>>({});

  // ✅ NOVO: Estado para o modal de estoque zerado
  const [isZeroStockDialogOpen, setIsZeroStockDialogOpen] = useState(false);
  const [productWithZeroStock, setProductWithZeroStock] =
    useState<Produto | null>(null);

  const { getEstoqueProdutoId } = useProdutos();

  const fetchEstoque = useCallback(
    async (produtoId: string) => {
      if (estoques[produtoId] !== undefined) return;
      try {
        const estoqueTotal = await getEstoqueProdutoId(produtoId);
        setEstoques((prev) => ({ ...prev, [produtoId]: estoqueTotal }));
      } catch (err) {
        console.error("Erro ao buscar estoque:", err);
        setEstoques((prev) => ({ ...prev, [produtoId]: 0 }));
      }
    },
    [estoques, getEstoqueProdutoId]
  );

  // ✅ NOVO: Callback que será passado para o hook
  const handleZeroStock = (produto: Produto) => {
    setProductWithZeroStock(produto);
    setIsZeroStockDialogOpen(true);
  };

  const {
    saleItems,
    // ...
    // (outros estados e funções retornados do hook)
    clearCart,
    addItemToSale,
    filteredProducts,
    loadingProdutos,
    handleSaveCustomer,
    isNewCustomerDialogOpen,
    newCustomerName,
    setNewCustomerName,
    setIsNewCustomerDialogOpen,
    // ...
    subtotal,
    total,
    change,
    lastAddedProduct,
    highlightedItemId,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    searchQuery,
    setSearchQuery,
    amountPaid,
    setAmountPaid,
    paymentMethod,
    setPaymentMethod,
    discount,
    setDiscount,
    selectedVendedor,
    setSelectedVendedor,
    selectedCliente,
    setSelectedCliente,
    updateItemQuantity,
    handleFinalize,
  } = usePdv(onFinalizeSale, estoques, handleZeroStock); // 🔄 ALTERADO: Passando o callback

  // Busca estoque para itens no carrinho
  useEffect(() => {
    saleItems.forEach((item) => {
      fetchEstoque(item.produto.id);
    });
  }, [saleItems, fetchEstoque]);

  // ✅ NOVO: Busca estoque para itens na lista de pesquisa
  useEffect(() => {
    if (filteredProducts.length > 0) {
      filteredProducts.forEach((produto) => {
        fetchEstoque(produto.id);
      });
    }
  }, [filteredProducts, fetchEstoque]);

  // ... (O resto do componente, incluindo useEffects e o JSX, segue abaixo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isPaymentDialogOpen ||
        isNewCustomerDialogOpen ||
        isZeroStockDialogOpen
      )
        return;

      if (e.key === "Delete" && saleItems.length > 0) {
        e.preventDefault();
        clearCart();
      }

      if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "F4" && saleItems.length > 0) {
        e.preventDefault();
        setIsPaymentDialogOpen(true);
      }
      if (e.key === "Escape") {
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    saleItems.length,
    isPaymentDialogOpen,
    isNewCustomerDialogOpen,
    isZeroStockDialogOpen, // Adicionado
    setIsPaymentDialogOpen,
    setSearchQuery,
    clearCart,
  ]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  const handleGoToMovements = () => {
    navigate("/movements");
  };

  if (loadingProdutos) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-muted/40 font-sans">
      {/* ... (Todo o JSX do PDV, painel esquerdo e direito, permanece o mesmo até o final) */}
      <div className="flex flex-1 flex-col p-4 gap-4">
        <div className="grid grid-rows-[1fr_auto] gap-4 h-full">
          <Card className="flex flex-col">
            <CardHeader>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Itens da Venda ({saleItems.length})</CardTitle>
                {saleItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Esvaziar Carrinho (Del)"
                    onClick={clearCart}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </CardHeader>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                {saleItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-10">
                    <p>Nenhum item adicionado.</p>
                    <p className="text-sm">Use a busca (F1) para começar.</p>
                  </div>
                ) : (
                  saleItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center p-4 border-b gap-4 transition-colors duration-500 ${
                        highlightedItemId === item.id
                          ? "bg-emerald-50 dark:bg-emerald-900/50"
                          : ""
                      }`}
                    >
                      <img
                        className="w-12 h-12 rounded-lg object-cover"
                        src={
                          item.produto.urlImage ||
                          "https://placehold.co/100x100"
                        }
                        alt={item.produto.nome}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">
                          {item.produto.nome}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (Estoque: {estoques[item.produto.id] ?? "--"})
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.precoVenda.toFixed(2)}
                        </p>
                      </div>
                      <Input
                        type="number"
                        className="w-20 text-center"
                        value={item.quantity}
                        min={1}
                        onChange={(e) =>
                          updateItemQuantity(
                            item.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                      <p className="w-24 text-right font-medium">
                        R$ {(item.precoVenda * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateItemQuantity(item.id, 0)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {lastAddedProduct ? (
              <Card className="flex flex-col items-center justify-center p-4 bg-secondary/30">
                <p className="font-semibold mb-2">{lastAddedProduct.nome}</p>
                <img
                  src={
                    lastAddedProduct.urlImage || "https://placehold.co/300x300"
                  }
                  alt={lastAddedProduct.nome}
                  className="w-24 h-24 object-cover rounded-md border"
                />
                <p className="mt-2 text-xl font-bold text-green-600">
                  R$ {parseFloat(lastAddedProduct.precoVenda).toFixed(2)}
                </p>
              </Card>
            ) : (
              <div />
            )}
            <Card>
              <CardContent className="p-4 flex justify-between items-center h-full">
                <div>
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="text-2xl font-bold">R$ {subtotal.toFixed(2)}</p>
                  <p className="text-muted-foreground mt-2">Desconto</p>
                  <p className="text-lg font-bold">{discount}%</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-green-600">
                    Total a Pagar
                  </p>
                  <p className="text-5xl font-extrabold text-green-600">
                    R$ {total.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="w-[400px] bg-background p-4 flex flex-col gap-4 border-l">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Caixa Aberto</h2>
          <div className="flex gap-2">
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="icon"
              aria-label="Tela Cheia"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={onExit}
              variant="destructive"
              size="icon"
              aria-label="Fechar PDV"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Label htmlFor="search">Buscar Produto (F1)</Label>
          <Search className="absolute left-2.5 top-9 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            id="search"
            placeholder="Digite o nome ou código de barras..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredProducts.length > 0) {
                addItemToSale(filteredProducts[0]);
                e.preventDefault();
              }
            }}
          />
          {filteredProducts.length > 0 && searchQuery && (
            <Card className="absolute top-full w-full mt-1 z-10 shadow-lg">
              <ScrollArea className="h-auto max-h-60">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 hover:bg-muted cursor-pointer flex justify-between"
                    onClick={() => addItemToSale(p)}
                  >
                    <span>{p.nome}</span>
                    <span className="font-semibold">
                      R$ {parseFloat(p.precoVenda).toFixed(2)}
                    </span>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}
        </div>

        <Separator />
        <div className="space-y-4">
          <div>
            <Label>Cliente</Label>
            <div className="flex items-center gap-2">
              <Select
                value={selectedCliente || ""}
                onValueChange={setSelectedCliente}
              >
                <SelectTrigger>
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Consumidor Final" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsNewCustomerDialogOpen(true)}
                aria-label="Adicionar Cliente"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Vendedor</Label>
            <Select
              value={selectedVendedor}
              onValueChange={setSelectedVendedor}
            >
              <SelectTrigger>
                <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span
            onClick={() => {
              setSelectedVendedor("");
              setSelectedCliente("");
              setSearchQuery("");
            }}
            className="text-sm text-red-500 cursor-pointer hover:underline"
          >
            Limpar seleção
          </span>
        </div>
        <Separator />
        <div className="flex-1" />
        <Button
          onClick={() => setIsPaymentDialogOpen(true)}
          disabled={saleItems.length === 0}
          size="lg"
          className="w-full py-8 text-xl font-bold"
        >
          <DollarSign className="h-6 w-6 mr-2" /> Finalizar Venda (F4)
        </Button>
      </div>

      {/* ✅ CORREÇÃO: Modais com o conteúdo restaurado */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {!selectedVendedor ? (
            <div className="text-sm text-red-500 text-center p-4">
              Selecione um Vendedor
            </div>
          ) : null}
          <DialogHeader>
            <DialogTitle className="text-2xl">Finalizar Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">Total a Pagar</p>
              <p className="text-5xl font-bold text-primary">
                R$ {total.toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Desconto (%)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                />
              </div>
              <div>
                <Label>Forma de Pagamento</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value);
                    if (value !== "Dinheiro") setAmountPaid(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {paymentMethod === "Dinheiro" && (
              <div className="space-y-2 p-4 border rounded-lg">
                <h3 className="font-semibold flex items-center">
                  <Coins className="w-4 h-4 mr-2" /> Pagamento em Dinheiro
                </h3>
                <div>
                  <Label htmlFor="amount-paid">Valor Recebido</Label>
                  <Input
                    id="amount-paid"
                    type="number"
                    placeholder="R$ 0,00"
                    value={amountPaid || ""}
                    onChange={(e) =>
                      setAmountPaid(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                {change > 0 && (
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/50 rounded-md">
                    <p className="text-sm text-blue-600">Troco</p>
                    <p className="text-2xl font-bold text-blue-700">
                      R$ {change.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleFinalize}
              disabled={!paymentMethod || !selectedVendedor}
            >
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNewCustomerDialogOpen}
        onOpenChange={setIsNewCustomerDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Cadastrar Novo Cliente
            </DialogTitle>
            <DialogDescription>
              Preencha o nome do cliente para adicioná-lo rapidamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-customer-name">Nome do Cliente</Label>
            <Input
              id="new-customer-name"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="Ex: João da Silva"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveCustomer();
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewCustomerDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveCustomer}>Salvar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isZeroStockDialogOpen}
        onOpenChange={setIsZeroStockDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileWarning className="h-6 w-6 text-amber-500" />
              Produto Sem Estoque
            </DialogTitle>
            <DialogDescription className="pt-2">
              O produto "
              <span className="font-semibold text-foreground">
                {productWithZeroStock?.nome}
              </span>
              " está com o estoque zerado e não pode ser adicionado à venda.
              <br />
              Deseja ir para a tela de movimentações para adicionar mais
              unidades?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsZeroStockDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleGoToMovements}>Ir para Movimentações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ NOVO: Modal para Estoque Zerado */}
      <Dialog
        open={isZeroStockDialogOpen}
        onOpenChange={setIsZeroStockDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileWarning className="h-6 w-6 text-amber-500" />
              Produto Sem Estoque
            </DialogTitle>
            <DialogDescription className="pt-2">
              O produto "
              <span className="font-semibold text-foreground">
                {productWithZeroStock?.nome}
              </span>
              " está com o estoque zerado e não pode ser adicionado à venda.
              <br />
              Deseja ir para a tela de movimentações para adicionar mais
              unidades?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsZeroStockDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleGoToMovements}>Ir para Movimentações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;
