
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, SaleItem } from "@/contexts/SalesContext";
import { useSales } from "@/contexts/SalesContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MinusCircle, XCircle, ArrowLeft } from "lucide-react";
import { useClientes } from "@/contexts/ClienteContext";
import { useVendedores } from "@/contexts/VendedorContext";

interface PDVProps {
  saleItems: SaleItem[];
  setSaleItems: React.Dispatch<React.SetStateAction<SaleItem[]>>;
  products: Product[];
  handleFinalizeSale: () => void;
  setIsPdvMode: (isPdvMode: boolean) => void;
  selectedCliente: string | undefined;
  setSelectedCliente: (clienteId: string | undefined) => void;
  selectedVendedor: string | undefined;
  setSelectedVendedor: (vendedorId: string | undefined) => void;
  discount: string;
  setDiscount: (discount: string) => void;
  paymentMethod: string | undefined;
  setPaymentMethod: (paymentMethod: string | undefined) => void;
}

const PDV = ({ 
  saleItems, 
  setSaleItems, 
  products, 
  handleFinalizeSale, 
  setIsPdvMode,
  selectedCliente,
  setSelectedCliente,
  selectedVendedor,
  setSelectedVendedor,
  discount,
  setDiscount,
  paymentMethod,
  setPaymentMethod
}: PDVProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientes } = useClientes();
  const { vendedores } = useVendedores();

  const filteredProducts = products.filter((product) =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (product: Product) => {
    const existingItem = saleItems.find((item) => item.id === product.id);
    if (existingItem) {
      setSaleItems(
        saleItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          id: product.id,
          produto: product,
          precoVenda: product.precoVenda,
          precoCusto: product.precoCusto,
          quantity: 1,
          type: "produto",
        },
      ]);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setSaleItems(saleItems.filter((item) => item.id !== id));
    } else {
      setSaleItems(
        saleItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const subtotal = saleItems.reduce(
    (acc, item) => acc + item.precoVenda * item.quantity,
    0
  );
  const discountAmount = (subtotal * parseFloat(discount)) / 100;
  const total = subtotal - discountAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Product Selection */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Produtos</CardTitle>
              <Button onClick={() => setIsPdvMode(false)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleAddItem(product)}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <img src="/placeholder.svg" alt={product.nome} className="w-24 h-24 mb-2" />
                      <p className="text-center font-semibold">{product.nome}</p>
                      <p className="text-center text-muted-foreground">
                        {product.precoVenda.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Sale Details */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] mb-4">
              {saleItems.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Nenhum item na venda.
                </p>
              ) : (
                saleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between mb-2"
                  >
                    <div>
                      <p className="font-semibold">{item.produto.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.precoVenda.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, 0)}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vendedor</Label>
                <Select value={selectedVendedor} onValueChange={setSelectedVendedor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendedores.map((vendedor) => (
                      <SelectItem key={vendedor.id} value={vendedor.id}>
                        {vendedor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    onBlur={(e) =>
                      setDiscount(String(parseFloat(e.target.value) || 0))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>
                  {total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
              <Button className="w-full" size="lg" onClick={handleFinalizeSale}>
                Finalizar Venda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDV;
