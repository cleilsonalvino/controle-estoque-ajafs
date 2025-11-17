import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { useAuth } from "@/contexts/useAuth";
import { FinanceCard } from "@/components/financeiro/FinanceCard";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { FluxoCaixaChart } from "@/components/financeiro/FluxoCaixaChart";
import { DespesasChart } from "@/components/financeiro/DespesasChart";
import { ReceitasChart } from "@/components/financeiro/ReceitasChart";
import { DataTable } from "@/components/ui/data-table";
import { vencimentosColumns } from "@/components/financeiro/VencimentosColumns";
import { recebimentosColumns } from "@/components/financeiro/RecebimentosColumns";
import { movimentacoesColumns } from "@/components/financeiro/MovimentacoesColumns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FinanceiroDashboard: React.FC = () => {
  const { summary, loading, contasPagar, contasReceber, movimentacoes } =
    useFinanceiro();
  const { user } = useAuth();

  const isNotAdmin =
    user?.papel?.toLowerCase() !== "administrador" &&
    user?.email?.toLowerCase() !== "ajafs@admin.com";

  if (loading) {
    return <div>Carregando...</div>; // Or a skeleton loader
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      {/* CONTEÚDO COM BLUR */}
      <div className="p-4 space-y-4 blur-sm pointer-events-none select-none">
        <span className="opacity-0">Ainda não implementado</span>
        <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <FinanceCard
            title="Saldo Atual"
            value={summary.saldoAtual}
            icon={DollarSign}
            tooltipText="Saldo total em todas as contas."
          />
          <FinanceCard
            title="Entradas do Mês"
            value={summary.totalEntradas}
            icon={TrendingUp}
            tooltipText="Total de receitas no mês corrente."
            trend="positive"
          />
          <FinanceCard
            title="Saídas do Mês"
            value={summary.totalSaidas}
            icon={TrendingDown}
            tooltipText="Total de despesas no mês corrente."
            trend="negative"
          />
          <FinanceCard
            title="Lucro Líquido"
            value={summary.lucroLiquido}
            icon={Scale}
            tooltipText="Entradas - Saídas no mês corrente."
          />
          <FinanceCard
            title="Contas a Pagar (7d)"
            value={summary.contasPagar}
            icon={AlertTriangle}
            tooltipText="Contas que vencem nos próximos 7 dias."
            trend="negative"
          />
          <FinanceCard
            title="Contas a Receber (7d)"
            value={summary.contasReceber}
            icon={CheckCircle}
            tooltipText="Valores a receber nos próximos 7 dias."
            trend="positive"
          />
        </div>

        {/* Charts */}
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
            <div className="lg:col-span-3">
              <FluxoCaixaChart />
            </div>
            <div className="lg:col-span-2">
              <DespesasChart />
            </div>
          </div>
          <div className="mt-4">
            <ReceitasChart />
          </div>
        </div>

        {/* Tables */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Próximos Vencimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={vencimentosColumns} data={contasPagar} />
            </CardContent>
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Próximos Recebimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={recebimentosColumns} data={contasReceber} />
            </CardContent>
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Últimas Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={movimentacoesColumns} data={movimentacoes} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* OVERLAY */}
      <div
        className="absolute inset-0 flex items-center justify-center 
                  bg-black/20 backdrop-blur-sm
                  text-white font-semibold text-xl"
      >
        🚧 Funcionalidade ainda não implementada
      </div>
    </div>
  );
};

export default FinanceiroDashboard;
