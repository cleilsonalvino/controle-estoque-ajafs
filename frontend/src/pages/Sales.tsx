// pages/Sales.tsx
import { useState, useEffect } from "react";
import { ShoppingCart, DollarSign, Trash2, Table } from "lucide-react";
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
import { TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";


// === Tipagem ===
export interface Product {
 id: string;
  nome: string;
  preco: number; // Changed from string to number
}

export interface SaleItem extends Product {
  quantity: number;
  produtoId?: string;
  quantidade?: string
  precoUnitario?: string;
}

// === SalesForm ===
interface SalesFormProps {
  products: Product[];
  onAddProductToSale: (product: Product, quantity: number) => void;
}

const SalesForm = ({ products, onAddProductToSale }: SalesFormProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined); // Keep as string
  const [quantity, setQuantity] = useState(1);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

 

  const handleAddClick = () => {
    if (selectedProduct && quantity > 0) { // selectedProduct is of type Product from SalesContext
      onAddProductToSale(selectedProduct, quantity);
      setSelectedProductId(undefined);
      setQuantity(1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Produto</CardTitle>
        <CardDescription>Selecione um produto e a quantidade</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product">Produto</Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
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

        {selectedProduct && (
          <div className="space-y-2">
            <Label>Preço</Label>
            <p className="text-lg font-semibold">{selectedProduct.preco}</p>
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
          disabled={!selectedProduct || quantity <= 0}
          className="w-full bg-gradient-primary hover:opacity-90 shadow-md"
        >
          Adicionar à Venda
        </Button>
      </CardContent>
    </Card>
  );
};

// === SalesTable ===
interface SalesTableProps {
  items: SaleItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

const SalesTable = ({ items, onRemoveItem, onUpdateQuantity }: SalesTableProps) => {
  const subtotal = items.reduce((acc, item) => acc + Number(item.preco) * item.quantity, 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead className="w-[100px]">Qtd.</TableHead>
          <TableHead className="text-right">Preço Unit.</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length > 0 ? (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.nome}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, Number(e.target.value))}
                  className="w-16"
                />
              </TableCell>
              <TableCell className="text-right">{item.preco}</TableCell>
              <TableCell className="text-right">{(Number(item.preco) * item.quantity).toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              Nenhum produto na venda.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
          <TableCell className="text-right font-bold">
            {subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

// === Página de Vendas ===
const Sales = () => {
  const { createSale, products } = useSales();
  const { clientes, createCliente } = useClientes();
  const { vendedores, createVendedor } = useVendedores();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string | undefined>(undefined);
  const [selectedVendedor, setSelectedVendedor] = useState<string | undefined>(undefined);

  const handleAddProductToSale = (product: Product, quantity: number) => {
    const existing = saleItems.find((i) => i.id === product.id);
    if (existing) {
      setSaleItems(saleItems.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      setSaleItems([...saleItems, { ...product, quantity }]);
    }
  };

  const handleRemoveItem = (id: string) => setSaleItems(saleItems.filter(i => i.id !== id));
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return handleRemoveItem(id);
    setSaleItems(saleItems.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const handleFinalizeSale = async () => {
    if (!selectedCliente) {
      alert("Por favor, selecione um cliente.");
      return;
    }

    if (!selectedVendedor) {
      alert("Por favor, selecione um vendedor.");
      return;
    }

    const saleData = {
      clienteId: selectedCliente,
      vendedorId: selectedVendedor,
      itens: saleItems.map(item => ({
        produtoId: item.id,
        quantidade: item.quantity,
        precoUnitario: item.preco,
      })),
    };

    try {
      await createSale(saleData);
      setSaleItems([]);
      setSelectedCliente(undefined);
      setSelectedVendedor(undefined);
      alert("Venda criada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar venda");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 bg-gradient-primary rounded-lg">
          <ShoppingCart className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registrar Venda</h1>
          <p className="text-muted-foreground">Adicione produtos e finalize a venda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <SalesForm products={products} onAddProductToSale={handleAddProductToSale} />
        </div>
        <div className="lg:col-span-2">
          <div className="space-y-2 mb-4">
            <Label htmlFor="client-name">Cliente</Label>
            <div className="flex gap-2">
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
                      <Input id="new-client-name" />
                    </div>
                    <Button onClick={() => { createCliente({ nome: (document.getElementById('new-client-name') as HTMLInputElement).value, email: '', telefone: '' }) }}>Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="vendedor">Vendedor</Label>
            <div className="flex gap-2">
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
                    <Button onClick={() => { createVendedor({ nome: (document.getElementById('new-vendedor-name') as HTMLInputElement).value, email: '', meta: 0 }) }}>Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <SalesTable items={saleItems} onRemoveItem={handleRemoveItem} onUpdateQuantity={handleUpdateQuantity} />
          <div className="flex justify-end mt-4">
            <Button onClick={handleFinalizeSale} disabled={saleItems.length === 0} className="bg-gradient-primary hover:opacity-90 shadow-md">
              <DollarSign className="h-4 w-4 mr-2" /> Finalizar Venda
            </Button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Sales;
