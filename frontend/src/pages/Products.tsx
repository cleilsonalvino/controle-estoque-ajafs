import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductList } from "@/components/ProductList";
import { AddProductDialog } from "@/components/AddProductDialog";
import type { Product } from "@/pages/Dashboard";

const Products = () => {
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
    {
      id: "5",
      name: "Teclado Mecânico",
      category: "Eletrônicos",
      quantity: 12,
      minStock: 5,
      price: 299.99,
    },
    {
      id: "6",
      name: "Monitor 24 polegadas",
      category: "Eletrônicos", 
      quantity: 7,
      minStock: 3,
      price: 799.99,
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
              <p className="text-muted-foreground">Gerencie todos os seus produtos</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Content */}
      <ProductList 
        products={products}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default Products;