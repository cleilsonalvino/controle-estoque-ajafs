import { useState } from "react";
import { ShoppingCart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesForm } from "@/components/SalesForm";
import { SalesTable } from "@/components/SalesTable";
import type { Product } from "@/pages/Dashboard";

export interface SaleItem extends Product {
  quantity: number;
}

const Sales = () => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  const handleAddProductToSale = (product: Product, quantity: number) => {
    const existingItem = saleItems.find((item) => item.id === product.id);

    if (existingItem) {
      setSaleItems(
        saleItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setSaleItems([...saleItems, { ...product, quantity }]);
    }
  };

  const handleRemoveItemFromSale = (productId: string) => {
    setSaleItems(saleItems.filter((item) => item.id !== productId));
  };

  const handleUpdateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItemFromSale(productId);
    } else {
      setSaleItems(
        saleItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleFinalizeSale = () => {
    // Here you would typically send the sale data to a server
    console.log("Sale finalized:", saleItems);
    setSaleItems([]);
    // You might want to show a success message here
  };

  const products: Product[] = [
    {
      id: "1",
      name: "Smartphone Samsung Galaxy",
      category: "Eletrônicos",
      quantity: 25,
      minStock: 10,
      price: 1299.99,
    },
    {
      id: "2",
      name: "Notebook Dell Inspiron",
      category: "Eletrônicos",
      quantity: 8,
      minStock: 5,
      price: 2499.99,
    },
    {
      id: "3",
      name: "Mesa de Escritório",
      category: "Móveis",
      quantity: 3,
      minStock: 8,
      price: 599.99,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Registrar Venda</h1>
              <p className="text-muted-foreground">Adicione produtos e finalize a venda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <SalesForm products={products} onAddProductToSale={handleAddProductToSale} />
        </div>
        <div className="lg:col-span-2">
          <SalesTable
            items={saleItems}
            onRemoveItem={handleRemoveItemFromSale}
            onUpdateQuantity={handleUpdateItemQuantity}
          />
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleFinalizeSale}
              disabled={saleItems.length === 0}
              className="bg-gradient-primary hover:opacity-90 shadow-md"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Finalizar Venda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
