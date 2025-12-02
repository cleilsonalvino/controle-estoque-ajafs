// src/components/financeiro/DespesasChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { CategoriaResumo } from "@/contexts/FinanceiroContext";

interface DespesasChartProps {
  data?: CategoriaResumo[]; // <- agora é opcional
}

const COLORS = ["#16a34a", "#2563eb", "#f97316", "#9333ea", "#64748b"];

export const DespesasChart = ({ data = [] }: DespesasChartProps) => {
  // garante que SEMPRE é array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Despesas</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={safeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={90}
              fill="#8884d8"
              dataKey="total"
              nameKey="categoria"
              label={(entry) =>
                `${entry.categoria} (${(entry.percent * 100).toFixed(0)}%)`
              }
            >
              {safeData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value)
              }
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
