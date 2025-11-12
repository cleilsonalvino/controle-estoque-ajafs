
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FollowUpsPorStatus } from '@/types/pos-venda';

interface FollowUpsChartProps {
  data: FollowUpsPorStatus;
}

const FollowUpsChart = ({ data }: FollowUpsChartProps) => {
  const chartData = [
    {
      name: 'Follow-ups',
      Realizados: data.realizados,
      Pendentes: data.pendentes,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <Legend />
        <Bar dataKey="Realizados" fill="hsl(var(--primary))" />
        <Bar dataKey="Pendentes" fill="hsl(var(--muted-foreground))" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FollowUpsChart;
