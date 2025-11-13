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

const data = [
  { name: "Venda de Produtos", value: 25000 },
  { name: "Serviço de Manutenção", value: 15000 },
  { name: "Consultoria", value: 8000 },
  { name: "Venda de Acessórios", value: 5000 },
  { name: "Outros", value: 2000 },
];

export const ReceitasChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Categorias de Receitas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
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
            <Bar dataKey="value" fill="#16a34a" name="Receita" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
