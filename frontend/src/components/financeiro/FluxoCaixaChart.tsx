// src/components/financeiro/FluxoCaixaChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  BarChart,
  Bar,
} from "recharts";

const data = [
  { month: "Jan", entradas: 4000, saidas: 2400 },
  { month: "Fev", entradas: 3000, saidas: 1398 },
  { month: "Mar", entradas: 2000, saidas: 9800 },
  { month: "Abr", entradas: 2780, saidas: 3908 },
  { month: "Mai", entradas: 1890, saidas: 4800 },
  { month: "Jun", entradas: 2390, saidas: 3800 },
  { month: "Jul", entradas: 3490, saidas: 4300 },
  { month: "Ago", entradas: 3490, saidas: 4300 },
  { month: "Set", entradas: 3490, saidas: 4300 },
  { month: "Out", entradas: 3490, saidas: 4300 },
  { month: "Nov", entradas: 3490, saidas: 4300 },
  { month: "Dez", entradas: 4500, saidas: 3200 },
];

export const FluxoCaixaChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa (Últimos 12 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
