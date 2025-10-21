// src/pages/PDV.tsx

import { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Search,
  User,
  Tag,
  DollarSign,
  Trash2,
  Maximize,
  Minimize,
} from "lucide-react";
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
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SaleItem } from "@/contexts/SalesContext";
import { Produto } from "@/contexts/ProdutoContext";
import { Cliente } from "@/contexts/ClienteContext";
import { Vendedor } from "@/contexts/VendedorContext";

interface PDVProps {
  produtos: Produto[];
  clientes: Cliente[];
  vendedores: Vendedor[];
  onFinalizeSale: (saleData: any) => Promise<boolean>;
  onExit: () => void;
}

const PDV = ({
  produtos,
  clientes,
  vendedores,
  onFinalizeSale,
  onExit,
}: PDVProps) => {
  // Estados da Venda
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string | undefined>();
  const [selectedVendedor, setSelectedVendedor] = useState<
    string | undefined
  >();
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>();

  // Estados da UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs para focar nos inputs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const clienteSelectRef = useRef<HTMLButtonElement>(null);

  // Lógica de busca de produtos
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return produtos.filter((p) =>
      p.codigoBarras?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, produtos]);

  // Funções de manipulação do carrinho
  const addItemToSale = (produto: Produto) => {
    setSaleItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === produto.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === produto.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevItems,
        {
          id: produto.id,
          produto: produto,
          precoVenda: parseFloat(produto.precoVenda),
          precoCusto: produto.lote?.[0]?.precoCusto || 0,
          quantity: 1,
          type: "produto",
        },
      ];
    });
    setSearchQuery("");
  };

  const updateItemQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSaleItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setSaleItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Cálculos de total
  const subtotal = useMemo(
    () =>
      saleItems.reduce(
        (acc, item) => acc + (item.precoVenda || 0) * item.quantity,
        0
      ),
    [saleItems]
  );
  const total = useMemo(
    () => subtotal - (subtotal * discount) / 100,
    [subtotal, discount]
  );

  // Efeito para atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "F2") {
        e.preventDefault();
        clienteSelectRef.current?.click();
      }
      if (e.key === "F4" && saleItems.length > 0) {
        e.preventDefault();
        setIsPaymentDialogOpen(true);
      }
      if (e.key === "Escape") {
        setIsPaymentDialogOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saleItems]);

  // Lógica de Tela Cheia
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleFinalize = async () => {
    if (!selectedVendedor || !paymentMethod) {
      alert("Vendedor e Forma de Pagamento são obrigatórios.");
      return;
    }

    const success = await onFinalizeSale({
      saleItems,
      clienteId: selectedCliente,
      vendedorId: selectedVendedor,
      desconto: discount,
      formaPagamento: paymentMethod,
    });

    if (success) {
      // Limpa o estado para a próxima venda
      setSaleItems([]);
      setSelectedCliente(undefined);
      setSelectedVendedor(undefined);
      setDiscount(0);
      setPaymentMethod(undefined);
      setIsPaymentDialogOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-muted/40">
      {/* Coluna Esquerda: Itens e Total */}
      <div className="flex flex-1 flex-col p-4 gap-4">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Itens da Venda</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(100vh-250px)]">
              {saleItems.length === 0 ? (
                <div className="text-center p-10 text-muted-foreground">
                  <p>Nenhum item adicionado.</p>
                  <p className="text-sm">Use a busca (F1) para começar.</p>
                </div>
              ) : (
                saleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-4 border-b gap-4"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{item.produto.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {item.precoVenda.toFixed(2)}
                      </p>
                    </div>
                    <Input
                      type="number"
                      className="w-20"
                      value={item.quantity}
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
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground">Subtotal</p>
              <p className="text-2xl font-bold">R$ {subtotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Desconto</p>
              <p className="text-2xl font-bold">{discount}%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-green-600">
                Total a Pagar
              </p>
              <p className="text-4xl font-extrabold text-green-600">
                R$ {total.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Direita: Controles */}
      <div className="w-[380px] bg-background p-4 flex flex-col gap-4 border-l">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Caixa</h2>
          <div className="flex gap-2">
            <Button onClick={toggleFullscreen} variant="outline" size="icon">
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button onClick={onExit} variant="destructive" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Busca de Produto */}
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
                addItemToSale(filteredProducts[0]); // adiciona o primeiro produto encontrado
                e.preventDefault();
              }
            }}
          />

          {filteredProducts.length > 0 && (
            <Card className="absolute top-full w-full mt-1 z-10">
              <ScrollArea className="h-auto max-h-60">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 hover:bg-muted cursor-pointer"
                    onClick={() => addItemToSale(p)}
                  >
                    {p.nome} - R$ {parseFloat(p.precoVenda).toFixed(2)}
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}
        </div>
        <Separator />
        {/* Cliente e Vendedor */}
        <div className="space-y-4">
          <div>
            <Label>Cliente (F2)</Label>
            <Select value={selectedCliente} onValueChange={setSelectedCliente}>
              <SelectTrigger ref={clienteSelectRef}>
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
          </div>
          <div>
            <Label>Vendedor</Label>
            <Select
              value={selectedVendedor}
              onValueChange={setSelectedVendedor}
            >
              <SelectTrigger>
                <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Selecione um vendedor" />
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
        </div>
        <Separator />
        <div className="flex-1" /> {/* Espaçador */}
        <Button
          onClick={() => setIsPaymentDialogOpen(true)}
          disabled={saleItems.length === 0}
          size="lg"
          className="w-full py-8 text-xl"
        >
          <DollarSign className="h-6 w-6 mr-2" /> Finalizar Venda (F4)
        </Button>
      </div>

      {/* Modal de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Finalizar Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-muted-foreground">Total</p>
              <p className="text-5xl font-bold">R$ {total.toFixed(2)}</p>
            </div>
            <div>
              <Label>Desconto (%)</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
    </div>
  );
};

export default PDV;
