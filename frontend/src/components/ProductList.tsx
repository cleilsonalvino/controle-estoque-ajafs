import { useState } from "react";
import { Package, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditProductDialog } from "@/components/EditProductDialog";
import type { Product } from "@/pages/Index";

interface ProductListProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductList = ({ products, onUpdateProduct, onDeleteProduct }: ProductListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = Array.from(new Set(products.map(p => p.category)));
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) return { label: "Sem estoque", variant: "destructive" as const, priority: 3 };
    if (product.quantity <= product.minStock) return { label: "Estoque baixo", variant: "destructive" as const, priority: 2 };
    return { label: "Em estoque", variant: "success" as const, priority: 1 };
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aStatus = getStockStatus(a);
    const bStatus = getStockStatus(b);
    return bStatus.priority - aStatus.priority;
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos ({filteredProducts.length})
          </CardTitle>
          <CardDescription>
            Gerencie todos os seus produtos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedProducts.map((product) => {
              const status = getStockStatus(product);
              return (
                <Card key={product.id} className="relative group hover:shadow-lg transition-all duration-300 border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {product.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {product.category}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={status.variant}
                        className="shrink-0"
                      >
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantidade</p>
                        <p className="font-semibold text-lg">
                          {product.quantity}
                          {product.quantity <= product.minStock && (
                            <AlertTriangle className="inline h-4 w-4 ml-1 text-destructive" />
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Preço</p>
                        <p className="font-semibold text-lg">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm bg-muted/30 rounded-lg p-3">
                      <p className="text-muted-foreground">Estoque mínimo: {product.minStock}</p>
                      <p className="font-medium">
                        Valor total: R$ {(product.quantity * product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteProduct(product.id)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== "all" 
                  ? "Tente ajustar os filtros de pesquisa."
                  : "Adicione seu primeiro produto para começar."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <EditProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        onUpdateProduct={onUpdateProduct}
      />
    </div>
  );
};