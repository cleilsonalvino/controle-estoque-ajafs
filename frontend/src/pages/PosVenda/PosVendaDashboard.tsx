import { useEffect } from 'react';
import { usePosVenda } from '@/contexts/PosVendaContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { AlertTriangle, Star, Repeat } from 'lucide-react';

// Components reais
import FollowUpsChart from '@/components/pos-venda/dashboard/FollowUpsChart';

// 🔧 Controle simples — só trocar para FALSE quando quiser liberar a tela
const EM_CONSTRUCAO = true;

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

  if (loading || !dashboardData) return <DashboardSkeleton />;

  return (
    <div className="p-6 space-y-6 relative">

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

      {/* 🔥 OVERLAY EM CONSTRUÇÃO — 100% FUNCIONANDO */}
      {EM_CONSTRUCAO && (
        <div
          className="
            absolute inset-0 z-50
            backdrop-blur-md bg-white/70
            flex flex-col items-center justify-center
            rounded-lg
          "
        >
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4" />

          <h2 className="text-3xl font-semibold text-gray-800">
            Em Construção
          </h2>

          <p className="mt-2 text-gray-700 text-sm max-w-sm text-center">
            Estamos trabalhando para entregar a melhor experiência de pós-venda para você.
          </p>
        </div>
      )}
    </div>
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
