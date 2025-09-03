import { useState } from "react";
import { Package, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockDashboard } from "@/components/StockDashboard";
import { ProductList } from "@/components/ProductList";
import { AddProductDialog } from "@/components/AddProductDialog";

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  image?: string;
}

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([
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
    {
      id: "4",
      name: "Cadeira Ergonômica",
      category: "Móveis", 
      quantity: 15,
      minStock: 6,
      price: 899.99,
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddProduct = (newProduct: Omit<Product, "id">) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString(),
    };
    setProducts([...products, product]);
    setShowAddDialog(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu estoque</p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <StockDashboard products={products} />
        <ProductList 
          products={products}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      </div>

      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default Dashboard;