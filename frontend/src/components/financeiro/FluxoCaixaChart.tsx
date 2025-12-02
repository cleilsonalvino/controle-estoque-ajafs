// src/components/financeiro/FluxoCaixaChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { FluxoCaixaPonto } from "@/contexts/FinanceiroContext";

interface FluxoCaixaChartProps {
  data?: FluxoCaixaPonto[]; // <- opcional
}

export const FluxoCaixaChart = ({ data = [] }: FluxoCaixaChartProps) => {

  // garante que SEMPRE é array
  const safeData = Array.isArray(data) ? data : [];

  const mapped = safeData.map((ponto) => ({
    month: ponto.mes,
    entradas: ponto.entradas,
    saidas: ponto.saidas,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa (Últimos 12 Meses)</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mapped}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value)
              }
            />
            <Legend />
            <Bar dataKey="entradas" fill="#16a34a" name="Entradas" />
            <Bar dataKey="saidas" fill="#dc2626" name="Saídas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
