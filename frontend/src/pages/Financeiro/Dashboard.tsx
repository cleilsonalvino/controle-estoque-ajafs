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

// 🔧 Controle da feature
const EM_CONSTRUCAO = true;

const FinanceiroDashboard: React.FC = () => {
  const { summary, loading, contasPagar, contasReceber, movimentacoes } =
    useFinanceiro();
  const { user } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)]">

      {/* === CONTEÚDO REAL (com blur quando em construção) === */}
      <div className={EM_CONSTRUCAO ? "blur-md pointer-events-none select-none" : ""}>
        <div className="p-4 space-y-4">
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

          {/* Tabelas */}
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
                <DataTable
                  columns={movimentacoesColumns}
                  data={movimentacoes}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* === OVERLAY EM CONSTRUÇÃO === */}
      {EM_CONSTRUCAO && (
        <div
          className="
            absolute inset-0 z-40
            flex flex-col items-center justify-center
            backdrop-blur-md bg-white/60
            animate-fadeIn
          "
        >
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />

          <h2 className="text-3xl font-bold text-gray-800">
            Em Construção
          </h2>

          <p className="mt-2 text-gray-700 text-sm max-w-xs text-center">
            Estamos finalizando o módulo financeiro para entregar a melhor
            experiência de gestão para sua empresa.
          </p>
        </div>
      )}
    </div>
  );
};

export default FinanceiroDashboard;
