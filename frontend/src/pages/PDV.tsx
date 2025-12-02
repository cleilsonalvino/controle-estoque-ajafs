// src/pages/PDV.tsx

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  FileWarning,
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
import { useAuth } from "@/contexts/useAuth";

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

const DEFAULT_VENDEDOR_KEY = "pdv_default_vendedor";

// ============================================================================
// 🦁 Custom Hook: usePdv (CORRIGIDO E MELHORADO)
// ============================================================================
const usePdv = (
  onFinalizeSale: PDVProps["onFinalizeSale"],
  onZeroStock: (produto: Produto) => void
) => {
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { createCliente } = useClientes();

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string | null>();
  // ✅ NOVO: Carrega o vendedor padrão do localStorage
  const [selectedVendedor, setSelectedVendedor] = useState<string | undefined>(
    () => {
      return localStorage.getItem(DEFAULT_VENDEDOR_KEY) || undefined;
    }
  );
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>();
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // ✅ NOVO: Estados de busca separados
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [sellerSearchQuery, setSellerSearchQuery] = useState("");

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null
  );
  const [lastAddedProduct, setLastAddedProduct] = useState<Produto | null>(
    null
  );
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [NewCPFCustomer, setNewCPFCustomer] = useState("");

  const subtotal = useMemo(
    () =>
      saleItems.reduce(
        (acc, item) => acc + item.precoVenda * item.quantidade,
        0
      ),
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

  // 🔄 ALTERADO: Usa 'productSearchQuery'
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery) return [];
    const query = productSearchQuery.toLowerCase();
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(query) ||
        p.codigoBarras?.toLowerCase().includes(query)
    );
  }, [productSearchQuery, produtos]);

  const addItemToSale = useCallback(
    (produto: Produto) => {
      const estoqueDisponivel = produto.quantidadeTotal;

      if (estoqueDisponivel <= 0) {
        onZeroStock(produto);
        return;
      }

      setSaleItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === produto.id);

        if (existingItem) {
          if (existingItem.quantidade >= estoqueDisponivel) {
            toast.error(`Estoque máximo atingido para ${produto.nome}.`);
            return prevItems;
          }
          return prevItems.map((item) =>
            item.id === produto.id
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          );
        }

        return [
          ...prevItems,
          {
            id: produto.id,
            produto,
            precoVenda: parseFloat(produto.precoVenda),
            precoCusto: produto.lote?.[0]?.precoCusto || 0,
            quantidade: 1,
            type: "SAIDA",
          },
        ];
      });

      setLastAddedProduct(produto);
      setProductSearchQuery(""); // 🔄 ALTERADO
      setHighlightedItemId(produto.id);
      setTimeout(() => setHighlightedItemId(null), 600);
    },
    [onZeroStock]
  );

  const updateItemQuantity = useCallback(
    (id: string, newQuantity: number) => {
      const itemToUpdate = saleItems.find((item) => item.id === id);
      if (!itemToUpdate) return;

      const estoqueDisponivel = itemToUpdate.produto.quantidadeTotal;

      if (newQuantity > estoqueDisponivel) {
        toast.error(
          `Estoque insuficiente. Apenas ${estoqueDisponivel} unidades disponíveis.`
        );
        return;
      }

      setSaleItems((prev) =>
        newQuantity <= 0
          ? prev.filter((item) => item.id !== id)
          : prev.map((item) =>
              item.id === id ? { ...item, quantidade: newQuantity } : item
            )
      );
    },
    [saleItems]
  );

  const resetSale = useCallback(() => {
    setSaleItems([]);
    setSelectedCliente(undefined);
    // ✅ NOVO: Ao resetar a venda, mantém o vendedor padrão
    setSelectedVendedor(
      localStorage.getItem(DEFAULT_VENDEDOR_KEY) || undefined
    );
    setDiscount(0);
    setPaymentMethod(undefined);
    setIsPaymentDialogOpen(false);
    setLastAddedProduct(null);
    setAmountPaid(0);
    // ✅ NOVO: Limpa todas as buscas
    setProductSearchQuery("");
    setClientSearchQuery("");
    setSellerSearchQuery("");
  }, []);

  const clearCart = useCallback(() => {
    setSaleItems([]);
    localStorage.removeItem("pdv_cart");
    toast.info("Carrinho esvaziado com sucesso!");
  }, []);

  const handleFinalize = async () => {
    if (!selectedVendedor || !paymentMethod) {
      toast.error("Vendedor e Forma de Pagamento são obrigatórios.");
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
    const promise = createCliente({
      nome: newCustomerName.trim(),
      cpf: NewCPFCustomer.trim(),
    });
    toast.promise(promise, {
      loading: "Salvando novo cliente...",
      success: (newCustomer) => {
        if (newCustomer?.id) {
          setSelectedCliente(newCustomer.id);
          setIsNewCustomerDialogOpen(false);
          setNewCustomerName("");
          setNewCPFCustomer("");
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
    // ✅ NOVO: Retorna os 3 estados de busca
    productSearchQuery,
    setProductSearchQuery,
    clientSearchQuery,
    setClientSearchQuery,
    sellerSearchQuery,
    setSellerSearchQuery,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    highlightedItemId,
    lastAddedProduct,
    isNewCustomerDialogOpen,
    setIsNewCustomerDialogOpen,
    newCustomerName,
    NewCPFCustomer,
    setNewCPFCustomer,
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
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [isZeroStockDialogOpen, setIsZeroStockDialogOpen] = useState(false);
  const [productWithZeroStock, setProductWithZeroStock] =
    useState<Produto | null>(null);

  const handleZeroStock = (produto: Produto) => {
    setProductWithZeroStock(produto);
    setIsZeroStockDialogOpen(true);
  };

  const {
    saleItems,
    clearCart,
    addItemToSale,
    filteredProducts,
    loadingProdutos,
    handleSaveCustomer,
    isNewCustomerDialogOpen,
    newCustomerName,
    setNewCustomerName,
    setIsNewCustomerDialogOpen,
    subtotal,
    total,
    change,
    lastAddedProduct,
    highlightedItemId,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    // ✅ NOVO: Obtém os 3 estados de busca
    productSearchQuery,
    setProductSearchQuery,
    clientSearchQuery,
    setClientSearchQuery,
    sellerSearchQuery,
    setSellerSearchQuery,
    amountPaid,
    setAmountPaid,
    paymentMethod,
    setPaymentMethod,
    discount,
    setDiscount,
    selectedVendedor,
    setSelectedVendedor,
    selectedCliente,
    setNewCPFCustomer,
    NewCPFCustomer,
    setSelectedCliente,
    updateItemQuantity,
    handleFinalize,
  } = usePdv(onFinalizeSale, handleZeroStock);

  const handleGoToMovements = () => {
    navigate("/movements");
  };

  // ✅ NOVO: Função para gerar orçamento (para o botão e atalho F4)
  const handleGerarOrcamento = useCallback(() => {
    if (saleItems.length === 0) {
      toast.error("Adicione itens ao carrinho para gerar um orçamento.");
      return;
    }
    if (!selectedVendedor) {
      toast.error("Selecione um vendedor antes de gerar o orçamento.");
      return;
    }

    const budget = {
      saleItems,
      clienteId: selectedCliente || null,
      vendedorId: selectedVendedor,
      desconto: discount,
      total,
      data: new Date().toLocaleString("pt-BR"),
    };

    console.log("Orçamento gerado:", budget);
    toast.success("Orçamento gerado com sucesso!");

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <html>
          <head><title>Orçamento</title></head>
          <body style="font-family:sans-serif;padding:40px;">
            <h2>Orçamento</h2>
            <p><strong>Data:</strong> ${budget.data}</p>
            <p><strong>Vendedor:</strong> ${
              vendedores.find((v) => v.id === selectedVendedor)?.nome
            }</p>
            <p><strong>Cliente:</strong> ${
              clientes.find((c) => c.id === selectedCliente)?.nome ||
              "Consumidor Final"
            }</p>
            <hr>
            <h3>Itens</h3>
            <ul>
              ${saleItems
                .map(
                  (item) =>
                    `<li>${item.produto.nome} — ${
                      item.quantidade
                    } x R$ ${item.precoVenda.toFixed(2)} = R$ ${(
                      item.quantidade * item.precoVenda
                    ).toFixed(2)}</li>`
                )
                .join("")}
            </ul>
            <hr>
            <p><strong>Subtotal:</strong> R$ ${subtotal.toFixed(2)}</p>
            <p><strong>Desconto:</strong> ${discount}%</p>
            <h3><strong>Total:</strong> R$ ${total.toFixed(2)}</h3>
            <script>window.print();</script>
          </body>
        </html>
      `);
      win.document.close();
    }
  }, [
    saleItems,
    selectedCliente,
    selectedVendedor,
    discount,
    total,
    vendedores,
    clientes,
    subtotal,
  ]);

  // ✅ NOVO: useEffect de atalhos de teclado remapeado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isPaymentDialogOpen ||
        isNewCustomerDialogOpen ||
        isZeroStockDialogOpen
      )
        return;

      // F1: Focar busca de produto
      if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // F2: Finalizar Venda
      if (e.key === "F2" && saleItems.length > 0) {
        e.preventDefault();
        setIsPaymentDialogOpen(true);
      }

      // F3: Definir Vendedor Padrão
      if (e.key === "F3") {
        e.preventDefault();
        if (selectedVendedor) {
          localStorage.setItem(DEFAULT_VENDEDOR_KEY, selectedVendedor);
          const vendedorName =
            vendedores.find((v) => v.id === selectedVendedor)?.nome ||
            "Selecionado";
          toast.success(`Vendedor "${vendedorName}" definido como padrão!`);
        } else {
          toast.error(
            "Selecione um vendedor primeiro para definir como padrão."
          );
        }
      }

      // F4: Gerar Orçamento
      if (e.key === "F4") {
        e.preventDefault();
        handleGerarOrcamento();
      }

      // F5: Limpar Carrinho
      if (e.key === "F5" && saleItems.length > 0) {
        e.preventDefault();
        clearCart();
      }

      // F6: Ir para Movimentações
      if (e.key === "F6") {
        e.preventDefault();
        handleGoToMovements();
      }

      // ESC: Limpar buscas ou Sair do PDV
      if (e.key === "Escape") {
        e.preventDefault();
        if (productSearchQuery) {
          setProductSearchQuery("");
        } else if (clientSearchQuery) {
          setClientSearchQuery("");
        } else if (sellerSearchQuery) {
          setSellerSearchQuery("");
        } else {
          onExit(); // Sai do PDV se nenhuma busca estiver ativa
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    saleItems.length,
    isPaymentDialogOpen,
    isNewCustomerDialogOpen,
    isZeroStockDialogOpen,
    selectedVendedor,
    vendedores,
    handleGerarOrcamento,
    clearCart,
    onExit,
    productSearchQuery,
    setProductSearchQuery,
    clientSearchQuery,
    setClientSearchQuery,
    sellerSearchQuery,
    setSellerSearchQuery,
    setIsPaymentDialogOpen,
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

  const getImageUrl = (value: string | File | null) => {
    if (!value) {
      return "https://placehold.co/600x400?text=Sem+Imagem";
    }

    // Se for File (nova imagem escolhida)
    if (value instanceof File) {
      return URL.createObjectURL(value); // <- gera preview AUTOMÁTICO
    }

    // Se já for URL externa
    if (value.startsWith("http")) {
      return value;
    }

    // Se for caminho relativo salvo no banco
    const cleanPath = value.startsWith("/") ? value.substring(1) : value;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
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
      <div className="flex flex-1 flex-col p-4 gap-4">
        <div className="grid grid-rows-[1fr_auto] gap-4 h-full">
          <Card className="flex flex-col h-full overflow-y-auto">
            <CardHeader>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Itens da Venda ({saleItems.length})</CardTitle>
                {saleItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    // ✅ NOVO: Atalho F5
                    title="Esvaziar Carrinho (F5)"
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
  <p className="text-8xl font-bold text-foreground">CAIXA ABERTO</p>
  <p className="text-sm mb-6">Use a busca (F1) para começar.</p>

  <img
    src={
      user?.empresa?.logoEmpresa
        ? (user.empresa.logoEmpresa.startsWith("http")
            ? user.empresa.logoEmpresa
            : `${import.meta.env.VITE_API_URL}/${user.empresa.logoEmpresa.replace(/^\/+/, "")}`
          )
        : "https://placehold.co/300x300"
    }
    alt="Logo da Empresa"
    className=" h-40 object-cover rounded-lg border shadow-md mt-4"
  />
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
                        className="w-24 h-24 rounded-lg object-cover"
                        src={
                          getImageUrl(item.produto.urlImage) ||
                          "https://placehold.co/300x300"
                        }
                        alt={item.produto.nome}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">
                          {item.produto.nome}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (Estoque: {item.produto.quantidadeTotal ?? "--"})
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.precoVenda.toFixed(2)}
                        </p>
                      </div>
                      <Input
                        type="number"
                        className="w-20 text-center"
                        value={item.quantidade}
                        min={1}
                        onChange={(e) =>
                          updateItemQuantity(
                            item.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                      <p className="w-24 text-right font-medium">
                        R$ {(item.precoVenda * item.quantidade).toFixed(2)}
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
            {saleItems.length > 0 ? (
              <p className="text-lg animate-bounce m-2 text-amber-500">
                VENDA EM ANDAMENTO
              </p>
            ) : (
              <p></p>
            )}
            <p className="text-sm text-zinc-400 m-2">
              <strong>Atalhos do PDV:</strong>
              As teclas de atalho são as seguintes — <strong>F1</strong> foca a
              busca de produto,
              <strong>F2</strong> finaliza a venda,
              <strong>F3</strong> define o vendedor padrão,
              <strong>F4</strong> gera o orçamento,
              <strong>F5</strong> limpa o carrinho,
              <strong>F6</strong> leva para a tela de movimentações e{" "}
              <strong>ESC</strong> sai do PDV.
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {lastAddedProduct ? (
              <Card className="flex flex-col items-center justify-center p-4 bg-secondary/30">
                <p className="font-semibold mb-2">{lastAddedProduct.nome}</p>
                <img
                  src={
                    getImageUrl(lastAddedProduct.urlImage || "https://placehold.co/300x300")
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
              // ✅ NOVO: Atalho ESC
              aria-label="Fechar PDV (ESC)"
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
            // ✅ NOVO: Usa state 'productSearchQuery'
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredProducts.length > 0) {
                addItemToSale(filteredProducts[0]);
                e.preventDefault();
              }
            }}
          />
          {/* ✅ NOVO: Usa state 'productSearchQuery' */}
          {filteredProducts.length > 0 && productSearchQuery && (
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
          {/* CLIENTE - ✅ CORRIGIDO */}
          <div className="relative">
            <Label>Cliente</Label>
            <Input
              // ✅ NOVO: Usa 'clientSearchQuery' para o valor
              value={clientSearchQuery}
              // ✅ NOVO: Usa placeholder para mostrar seleção
              placeholder={
                selectedCliente
                  ? clientes.find((c) => c.id === selectedCliente)?.nome
                  : "Digite o nome ou CPF do cliente..."
              }
              // ✅ NOVO: Atualiza 'clientSearchQuery' e limpa seleção
              onChange={(e) => {
                setClientSearchQuery(e.target.value);
                setSelectedCliente(null);
              }}
              // ✅ NOVO: Limpa busca ao focar
              onFocus={() => setClientSearchQuery("")}
            />
            {/* ✅ NOVO: Mostra resultados com base em 'clientSearchQuery' */}
            {clientSearchQuery && (
              <Card className="absolute top-full w-full mt-1 z-10 shadow-lg">
                <ScrollArea className="h-auto max-h-60">
                  {clientes
                    .filter(
                      (c) =>
                        c.nome
                          .toLowerCase()
                          .includes(clientSearchQuery.toLowerCase()) ||
                        c.cpf?.includes(clientSearchQuery)
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-3 hover:bg-muted cursor-pointer flex justify-between"
                        onClick={() => {
                          setSelectedCliente(c.id);
                          // ✅ NOVO: Limpa busca ao selecionar
                          setClientSearchQuery("");
                        }}
                      >
                        <div>
                          <p className="font-medium">{c.nome}</p>
                          {c.cpf && (
                            <p className="text-xs text-muted-foreground">
                              CPF: {c.cpf}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  <div
                    className="p-3 hover:bg-muted cursor-pointer text-sm text-blue-600 text-center"
                    onClick={() => setIsNewCustomerDialogOpen(true)}
                  >
                    + Cadastrar novo cliente
                  </div>
                </ScrollArea>
              </Card>
            )}
          </div>

          {/* VENDEDOR - ✅ CORRIGIDO */}
          <div className="relative">
            {/* ✅ NOVO: Label com atalho F3 */}
            <Label>Vendedor (F3 p/ Padrão)</Label>
            <Input
              // ✅ NOVO: Usa 'sellerSearchQuery' para o valor
              value={sellerSearchQuery}
              // ✅ NOVO: Usa placeholder para mostrar seleção
              placeholder={
                selectedVendedor
                  ? vendedores.find((v) => v.id === selectedVendedor)?.nome
                  : "Digite o nome ou código do vendedor..."
              }
              // ✅ NOVO: Atualiza 'sellerSearchQuery' e limpa seleção
              onChange={(e) => {
                setSellerSearchQuery(e.target.value);
                setSelectedVendedor(undefined);
              }}
              // ✅ NOVO: Limpa busca ao focar
              onFocus={() => setSellerSearchQuery("")}
            />
            {/* ✅ NOVO: Mostra resultados com base em 'sellerSearchQuery' */}
            {sellerSearchQuery && (
              <Card className="absolute top-full w-full mt-1 z-10 shadow-lg">
                <ScrollArea className="h-auto max-h-60">
                  {vendedores
                    .filter(
                      (v) =>
                        v.nome
                          .toLowerCase()
                          .includes(sellerSearchQuery.toLowerCase()) ||
                        v.id
                          ?.toLowerCase()
                          .includes(sellerSearchQuery.toLowerCase())
                    )
                    .map((v) => (
                      <div
                        key={v.id}
                        className="p-3 hover:bg-muted cursor-pointer flex justify-between"
                        onClick={() => {
                          setSelectedVendedor(v.id);
                          // ✅ NOVO: Limpa busca ao selecionar
                          setSellerSearchQuery("");
                        }}
                      >
                        <div>
                          <p className="font-medium">{v.nome}</p>
                          {v.codigo && (
                            <p className="text-xs text-muted-foreground">
                              Código: {v.codigo}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </ScrollArea>
              </Card>
            )}
          </div>
          <span
            onClick={() => {
              setSelectedVendedor(undefined);
              setSelectedCliente(null);
              setClientSearchQuery("");
              setSellerSearchQuery("");
              // ✅ NOVO: Limpa também o vendedor padrão
              localStorage.removeItem(DEFAULT_VENDEDOR_KEY);
              toast.info("Seleção de cliente e vendedor (padrão) limpa.");
            }}
            className="text-sm text-red-500 cursor-pointer hover:underline"
          >
            Limpar seleção
          </span>
        </div>
        <Separator />

        <div className="flex-1" />
        <Button
          // ✅ NOVO: Usa a função 'handleGerarOrcamento'
          onClick={handleGerarOrcamento}
          disabled={saleItems.length === 0}
          variant="outline"
          size="lg"
          className="w-full py-6 text-lg font-semibold text-blue-600 border-blue-400"
        >
          {/* ✅ NOVO: Atalho F4 */}
          <FileWarning className="h-5 w-5 mr-2" /> Gerar Orçamento (F4)
        </Button>

        <Button
          onClick={() => setIsPaymentDialogOpen(true)}
          disabled={saleItems.length === 0}
          size="lg"
          className="w-full py-8 text-xl font-bold"
        >
          {/* ✅ NOVO: Atalho F2 */}
          <DollarSign className="h-6 w-6 mr-2" /> Finalizar Venda (F2)
        </Button>
      </div>

      {/* Modal de  Finalizar Venda*/}

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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

            {/* FORMA DE PAGAMENTO */}
<div className="space-y-2">
  <Label>Forma de Pagamento</Label>

  <select
    value={paymentMethod || ""}
    onChange={(e) => setPaymentMethod(e.target.value)}
    className="w-full border rounded-md p-2 text-sm bg-white dark:bg-slate-900"
  >
    <option value="">Selecione uma forma...</option>
    <option value="Dinheiro">Dinheiro</option>
    <option value="Pix">Pix</option>
    <option value="Débito">Cartão de Débito</option>
    <option value="Crédito">Cartão de Crédito</option>
    <option value="Outros">Outros</option>
  </select>

  {!paymentMethod && (
    <p className="text-xs text-red-500">Selecione a forma de pagamento</p>
  )}
</div>

            {/* DESCONTO ANTES DO PAGAMENTO */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) =>
                  setDiscount(Math.max(0, parseFloat(e.target.value) || 0))
                }
                className="text-lg font-semibold"
              />
              <p className="text-sm text-muted-foreground">
                O valor total será atualizado automaticamente.
              </p>

              <div className="bg-secondary p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Total Atualizado:
                </p>
                <p className="text-2xl font-bold text-primary">
                  R$ {total.toFixed(2)}
                </p>
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

      {/* Modal de Cadastrar Novo Cliente*/}
      <Dialog
        open={isNewCustomerDialogOpen}
        onOpenChange={setIsNewCustomerDialogOpen}
      >
        {/* ... (Conteúdo do Dialog de Novo Cliente não modificado) ... */}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Cadastrar Novo Cliente
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente para adicioná-lo rapidamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
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
            <div>
              <Label htmlFor="new-customer-cpf">CPF do Cliente</Label>
              <Input
                id="new-customer-cpf"
                value={NewCPFCustomer}
                onChange={(e) => setNewCPFCustomer(e.target.value)}
                placeholder="Ex: 08899955513 (Opcional)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveCustomer();
                }}
              />
            </div>
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

      {/* Modal de Produto Sem Estoque*/}
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
              {/* ✅ NOVO: Atalho F6 */}
              Deseja ir para a tela de movimentações (F6) para adicionar mais
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
