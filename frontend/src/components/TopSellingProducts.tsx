// src/components/TopSellingProducts.jsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "@/lib/api";

export default function TopSellingProducts() {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        const { data } = await axios.get("/vendas/reports/top-products");
        setTopProducts(data || []);
      } catch (error) {
        console.error("Erro ao carregar produtos mais vendidos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopProducts();
  }, []);

  return (
    <Card className="bg-gradient-card border-0 shadow-md">
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
        <CardDescription>
          Ranking de produtos por volume de vendas
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground py-4">
            Carregando...
          </div>
        ) : topProducts.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            Nenhum dado encontrado
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((item, index) => (
              <div
                key={item.produto?.id || index}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Badge className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="text-sm font-medium line-clamp-1">
                      {item.produto?.nome || "Produto sem nome"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.totalVendido} produto
                      {item.totalVendido > 1 ? "s" : ""} vendido
                      {item.produto?.categoria
                        ? ` • ${item.produto.categoria.nome}`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {item.produto?.precoVenda
                      ? `R$ ${(item.produto.precoVenda * item.totalVendido).toFixed(2)}`
                      : "R$ 0,00"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
