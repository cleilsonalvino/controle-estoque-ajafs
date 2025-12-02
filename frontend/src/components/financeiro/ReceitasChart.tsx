// src/components/financeiro/ReceitasChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { CategoriaResumo } from "@/contexts/FinanceiroContext";

interface ReceitasChartProps {
  data?: CategoriaResumo[]; // ← agora opcional
}

export const ReceitasChart = ({ data = [] }: ReceitasChartProps) => {
  // garante que SEMPRE seja array
  const safeData = Array.isArray(data) ? data : [];

  // Ordenar pela maior receita
  const top5 = [...safeData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const formatted = top5.map((item) => ({
    name: item.categoria,
    value: item.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Categorias de Receitas</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formatted} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" />

            <YAxis dataKey="name" type="category" width={150} />

            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value)
              }
            />

            <Legend />

            <Bar
              dataKey="value"
              fill="#16a34a"
              name="Receita"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
