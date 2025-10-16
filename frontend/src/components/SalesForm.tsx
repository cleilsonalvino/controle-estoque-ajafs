import { useState } from "react";
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
import type { Product } from "@/pages/Dashboard";

interface SalesFormProps {
  products: Product[];
  onAddProductToSale: (product: Product, quantity: number) => void;
}

export const SalesForm = ({ products, onAddProductToSale }: SalesFormProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(
    undefined
  );
  const [quantity, setQuantity] = useState(1);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleAddClick = () => {
    if (selectedProduct && quantity > 0) {
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
          <Select
            value={selectedProductId}
            onValueChange={setSelectedProductId}
          >
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
            <p className="text-lg font-semibold">
              {selectedProduct.preco}
            </p>
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
