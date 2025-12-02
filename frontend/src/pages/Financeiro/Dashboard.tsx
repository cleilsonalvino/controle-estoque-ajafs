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
import { useEffect } from "react";

const EM_CONSTRUCAO = false;

const FinanceiroDashboard: React.FC = () => {
  const {
    dashboard,
    loadingDashboard,
    contasPagar,
    contasReceber,
    movimentacoes,
    fetchDashboard
  } = useFinanceiro();

    useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loadingDashboard || !dashboard) {
    return (
      <div className="p-6 text-muted-foreground animate-pulse">
        Carregando painel financeiro...
      </div>
    );
  }

  

  return (
    <div className="relative min-h-[calc(100vh-80px)]">

      {/* ---- CONTEÚDO REAL ---- */}
      <div className={EM_CONSTRUCAO ? "blur-md pointer-events-none select-none" : ""}>
        <div className="p-4 space-y-6">
          <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>

          {/* ---------------- Cards principais ---------------- */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <FinanceCard
              title="Saldo Total"
              value={dashboard.saldoTotalContas}
              icon={DollarSign}
              tooltipText="Soma do saldo atual de todas as contas."
            />

            <FinanceCard
              title="Entradas do Mês"
              value={dashboard.totalEntradasMes}
              icon={TrendingUp}
              trend="positive"
              tooltipText="Total de receitas no mês atual."
            />

            <FinanceCard
              title="Saídas do Mês"
              value={dashboard.totalSaidasMes}
              icon={TrendingDown}
              trend="negative"
              tooltipText="Total de despesas no mês atual."
            />

            <FinanceCard
              title="Lucro Líquido"
              value={dashboard.lucroLiquidoMes}
              icon={Scale}
              tooltipText="Entradas - Saídas no mês."
            />

            <FinanceCard
              title="Contas a Pagar (7 dias)"
              value={dashboard.contasPagarProximos7Dias?.length ?? 0}
              icon={AlertTriangle}
              trend="negative"
              tooltipText="Contas com vencimento próximo."
            />

            <FinanceCard
              title="Contas a Receber (7 dias)"
              value={dashboard.contasReceberProximos7Dias?.length ?? 0}
              icon={CheckCircle}
              trend="positive"
              tooltipText="Recebimentos esperados nos próximos dias."
            />
          </div>

          {/* ---------------- Gráficos ---------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <FluxoCaixaChart data={dashboard.fluxoCaixaMensal} />
            </div>

            <div className="lg:col-span-2">
              <DespesasChart data={dashboard.despesasPorCategoria} />
            </div>
          </div>

          <div className="mt-4">
            <ReceitasChart data={dashboard.receitasPorCategoria} />
          </div>

          {/* ---------------- Tabelas ---------------- */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-1">
              <CardHeader>
                <CardTitle>Próximos Vencimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={vencimentosColumns}
                  data={dashboard.contasPagarProximos7Dias ?? []}
                />
              </CardContent>
            </Card>

            <Card className="xl:col-span-1">
              <CardHeader>
                <CardTitle>Próximos Recebimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={recebimentosColumns}
                  data={dashboard.contasReceberProximos7Dias ?? []}
                />
              </CardContent>
            </Card>

            <Card className="xl:col-span-1">
              <CardHeader>
                <CardTitle>Últimas Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={movimentacoesColumns}
                  data={dashboard.ultimasMovimentacoes ?? []}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ---- Overlay construção ---- */}
      {EM_CONSTRUCAO && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md">
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold">Em Construção</h2>

          <p className="text-gray-600 mt-2 text-sm text-center max-w-xs">
            Estamos finalizando o módulo financeiro para entregar uma solução completa.
          </p>
        </div>
      )}
    </div>
  );
};

export default FinanceiroDashboard;
