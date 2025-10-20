import { useState } from "react";
import { ShoppingCart, DollarSign, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSales } from "@/contexts/SalesContext";
import { useClientes } from "@/contexts/ClienteContext";
import { useVendedores } from "@/contexts/VendedorContext";
import { useTiposServicos } from "@/contexts/TiposServicosContext";
import { SalesTable } from "@/components/SalesTable";
import PDV from "./PDV";
import CupomFiscal from "@/components/CupomFiscal";
import { SaleItem } from "@/contexts/SalesContext";

// === Tipagem ===
export interface Product {
  id: string;
  nome: string;
  precoCusto: number;
  precoVenda: number;
}



// === SalesForm ===
interface SalesFormProps {
  products: Product[];
  tiposServicos: any[]; // Adjust this type as needed
  saleType: "produto" | "servico";
  setSaleType: (type: "produto" | "servico") => void;
  onAddProductToSale: (item: any, quantity: number) => void;
}

const SalesForm = ({
  products,
  tiposServicos,
  saleType,
  setSaleType,
  onAddProductToSale,
}: SalesFormProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(
    undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [preco, setPreco] = useState(0);

  const selectedItem =
    saleType === "produto"
      ? products.find((p) => p.id === selectedItemId)
      : tiposServicos.find((s) => s.id === selectedItemId);

  const handleAddClick = () => {
    if (selectedItem && quantity > 0) {
      const itemToAdd =
        saleType === "servico" ? { ...selectedItem, preco } : selectedItem;
      onAddProductToSale(itemToAdd, quantity);
      setSelectedItemId(undefined);
      setQuantity(1);
      setPreco(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Item</CardTitle>
        <CardDescription>
          Selecione o tipo de item, o item e a quantidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sale-type">Tipo de Venda</Label>
          <Select
            value={saleType}
            onValueChange={(value) =>
              setSaleType(value as "produto" | "servico")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de venda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="produto">Produto</SelectItem>
              <SelectItem value="servico">Serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {saleType === "produto" ? (
          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    products.length === 0
                      ? "Carregando..."
                      : "Selecione um produto"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="service">Serviço</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    tiposServicos.length === 0
                      ? "Carregando..."
                      : "Selecione um serviço"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tiposServicos.map((servico) => (
                  <SelectItem key={servico.id} value={servico.id}>
                    {servico.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedItem && (
          <div className="space-y-2">
            <Label>Preço</Label>
            {saleType === "produto" ? (
              <p className="text-lg font-semibold">
                {selectedItem.precoVenda} Reais
              </p>
            ) : (
              <Input
                type="number"
                value={preco}
                onChange={(e) => setPreco(Number(e.target.value))}
                placeholder="Digite o preço do serviço"
              />
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <Button
          onClick={handleAddClick}
          disabled={
            !selectedItem ||
            quantity <= 0 ||
            (saleType === "servico" && preco <= 0)
          }
          className="w-full bg-gradient-primary hover:opacity-90 shadow-md"
        >
          Adicionar à Venda
        </Button>
      </CardContent>
    </Card>
  );
};

// === Página de Vendas ===
const Sales = () => {
  const { createSale, products } = useSales();
  const { clientes, createCliente } = useClientes();
  const { vendedores, createVendedor } = useVendedores();
  const { tiposServicos } = useTiposServicos();
  const [saleType, setSaleType] = useState<"produto" | "servico">("produto");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string | undefined>(
    undefined
  );
  const [selectedVendedor, setSelectedVendedor] = useState<string | undefined>(
    undefined
  );
  const [discount, setDiscount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(
    undefined
  );
  const [nomeCliente, setNomeCliente] = useState<string>("");
  const [isPdvMode, setIsPdvMode] = useState(false);
  const [showCupom, setShowCupom] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const handleAddProductToSale = (item: any, quantity: number) => {
    const newSaleItems = JSON.parse(JSON.stringify(saleItems));
    const existing = newSaleItems.find(
      (i) => i.id === item.id && i.type === saleType
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      newSaleItems.push({ ...item, quantity, type: saleType });
    }
    setSaleItems(newSaleItems);
  };

  const handleRemoveItem = (id: string) =>
    setSaleItems(saleItems.filter((i) => i.id !== id));
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return handleRemoveItem(id);
    setSaleItems(saleItems.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const handleFinalizeSale = async () => {
    if (!selectedVendedor) {
      alert("Por favor, selecione um vendedor.");
      return;
    }

    if (!paymentMethod) {
      alert("Por favor, selecione uma forma de pagamento.");
      return;
    }

    const saleData = {
      clienteId: selectedCliente,
      vendedorId: selectedVendedor,
      desconto: parseFloat(discount) || 0,
      forma_pagamento: paymentMethod,
      itens: saleItems.map((item) => ({
        produtoId: item.type === "produto" ? item.id : undefined,
        servicoId: item.type === "servico" ? item.id : undefined,
        quantidade: item.quantity,
        precoUnitario:
          item.type === "produto" ? item.precoVenda : item.precoCusto,
      })),
    };

    try {
      await createSale(saleData);
      const clientName =
        clientes.find((c) => c.id === selectedCliente)?.nome || "";
      const vendedorName =
        vendedores.find((v) => v.id === selectedVendedor)?.nome || "";
      const subtotal = saleItems.reduce(
        (acc, item) => acc + item.precoVenda * item.quantity,
        0
      );
      const total = subtotal - (subtotal * (parseFloat(discount) || 0)) / 100;

      setLastSale({
        saleItems,
        total,
        discount: parseFloat(discount) || 0,
        paymentMethod,
        clientName,
        vendedorName,
      });
      setShowCupom(true);

      setSaleItems([]);
      setSelectedCliente(undefined);
      setSelectedVendedor(undefined);
      setDiscount("");
      setPaymentMethod(undefined);
      alert("Venda criada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar venda");
    }
  };

  if (isPdvMode) {
    return (
      <PDV
        saleItems={saleItems}
        setSaleItems={setSaleItems}
        products={products}
        handleFinalizeSale={handleFinalizeSale}
        setIsPdvMode={setIsPdvMode}
        selectedCliente={selectedCliente}
        setSelectedCliente={setSelectedCliente}
        selectedVendedor={selectedVendedor}
        setSelectedVendedor={setSelectedVendedor}
        discount={discount}
        setDiscount={setDiscount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />
    );
  }

  return (
    <div className="p-6">
      {showCupom && lastSale && (
        <CupomFiscal {...lastSale} onClose={() => setShowCupom(false)} />
      )}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <ShoppingCart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Registrar Venda
            </h1>
            <p className="text-muted-foreground">
              Adicione produtos e finalize a venda
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsPdvMode(true)} variant="outline">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Modo PDV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <SalesForm
            products={products}
            tiposServicos={tiposServicos}
            saleType={saleType}
            setSaleType={setSaleType}
            onAddProductToSale={handleAddProductToSale}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="space-y-2 mb-4">
            <Label htmlFor="client-name">Cliente</Label>
            <div className="flex gap-2">
              <Select
                value={selectedCliente}
                onValueChange={setSelectedCliente}
              >
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Novo Cliente</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-client-name">Nome</Label>
                      <Input
                        onChange={(nome) => setNomeCliente(nome.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        try {
                          createCliente({
                            nome: nomeCliente,
                            email: null,
                            telefone: null,
                            endereco: null,
                          });
                          setNomeCliente("");
                          alert("Cliente criado com sucesso!");
                        } catch (err) {
                          console.log(err);
                        }
                      }}
                    >
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="vendedor">Vendedor</Label>
            <div className="flex gap-2">
              <Select
                value={selectedVendedor}
                onValueChange={setSelectedVendedor}
              >
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Novo Vendedor</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Vendedor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-vendedor-name">Nome</Label>
                      <Input id="new-vendedor-name" />
                    </div>
                    <Button
                      onClick={() => {
                        createVendedor({
                          nome: (
                            document.getElementById(
                              "new-vendedor-name"
                            ) as HTMLInputElement
                          ).value,
                          email: "",
                          meta: 0,
                        });
                      }}
                    >
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SalesTable
            items={saleItems}
            discount={parseFloat(discount) || 0}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
          />
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleFinalizeSale}
              disabled={saleItems.length === 0}
              className="bg-gradient-primary hover:opacity-90 shadow-md"
            >
              <DollarSign className="h-4 w-4 mr-2" /> Finalizar Venda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
