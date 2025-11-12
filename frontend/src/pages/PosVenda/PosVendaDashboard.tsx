
import { useEffect } from 'react';
import { usePosVenda } from '@/contexts/PosVendaContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { AlertTriangle, Star, Users, Repeat } from 'lucide-react';

// Placeholder imports for dashboard components - to be created next
import FollowUpsChart from '@/components/pos-venda/dashboard/FollowUpsChart';
import DistribuicaoNotasChart from '@/components/pos-venda/dashboard/DistribuicaoNotasChart';
import RankingVendedores from '@/components/pos-venda/dashboard/RankingVendedores';
import ReclamacoesAbertas from '@/components/pos-venda/dashboard/ReclamacoesAbertas';

const StatCard = ({ title, value, icon, description, className = '' }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <Skeleton className="lg:col-span-3 h-80" />
            <Skeleton className="lg:col-span-2 h-80" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const { 
    mediaGeralSatisfacao, 
    taxaFidelizacao, 
    followUps,
    reclamacoesAbertas,
    distribuicaoNotas,
    rankingVendedores
  } = dashboardData;

  return (
    <motion.div 
        className="p-4 md:p-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold tracking-tight">Dashboard de Pós-Venda</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Satisfação Média"
            value={`${mediaGeralSatisfacao.toFixed(1)} / 5`}
            icon={<Star className="h-4 w-4 text-muted-foreground" />}
            description="Média geral de todas as avaliações"
        />
        <StatCard 
            title="Follow-ups Realizados"
            value={followUps.realizados}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description={`${followUps.pendentes} pendentes`}
        />
        <StatCard 
            title="Taxa de Fidelização"
            value={`${taxaFidelizacao.toFixed(1)}%`}
            icon={<Repeat className="h-4 w-4 text-muted-foreground" />}
            description="Clientes que compraram novamente"
        />
        <StatCard 
            title="Reclamações em Aberto"
            value={reclamacoesAbertas.length}
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
            description="Avaliações com nota 1 ou 2"
            className="border-destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Follow-ups Realizados vs. Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
                <FollowUpsChart data={followUps} />
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Distribuição de Notas</CardTitle>
            </CardHeader>
            <CardContent>
                <DistribuicaoNotasChart data={distribuicaoNotas} />
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Ranking de Vendedores</CardTitle>
            </CardHeader>
            <CardContent>
                <RankingVendedores data={rankingVendedores} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Reclamações Recentes (Nota ≤ 2)</CardTitle>
            </CardHeader>
            <CardContent>
                <ReclamacoesAbertas data={reclamacoesAbertas} />
            </CardContent>
        </Card>
      </div>

    </motion.div>
  );
}
