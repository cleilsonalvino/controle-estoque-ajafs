import { useEffect } from 'react';
import { usePosVenda } from '@/contexts/PosVendaContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { AlertTriangle, Star, Repeat } from 'lucide-react';

// Components reais
import FollowUpsChart from '@/components/pos-venda/dashboard/FollowUpsChart';

const StatCard = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function PosVendaDashboard() {
  const { dashboardData, loading, fetchDashboard } = usePosVenda();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold tracking-tight">Dashboard de Pós-Venda</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Satisfação Média"
          value={`${dashboardData.mediaSatisfacao.toFixed(1)} / 5`}
          description="Avaliações dos clientes"
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
        />

        <StatCard
          title="Follow-ups Realizados"
          value={dashboardData.followUpsRealizados}
          description={`${dashboardData.followUpsPendentes} pendentes`}
          icon={<Repeat className="h-4 w-4 text-muted-foreground" />}
        />

        <StatCard
          title="Pós-vendas Finalizados"
          value={dashboardData.posVendasFinalizadas}
          description="Atendimentos concluídos"
          icon={<Repeat className="h-4 w-4 text-muted-foreground" />}
        />

        <StatCard
          title="Taxa de Retorno"
          value={`${dashboardData.taxaRetorno.toFixed(1)}%`}
          description="Clientes que voltaram"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowUpsChart
            realizados={dashboardData.followUpsRealizados}
            pendentes={dashboardData.followUpsPendentes}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
