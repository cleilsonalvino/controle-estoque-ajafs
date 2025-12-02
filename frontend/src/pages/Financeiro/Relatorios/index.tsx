// src/pages/Financeiro/Relatorios/index.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Input } from "@/components/ui/input";
import { useFinanceiro } from "@/contexts/FinanceiroContext";

const EM_CONSTRUCAO = false;

const reports = [
  "Fluxo de Caixa Consolidado",
  "Resumo Financeiro Mensal",
  "Receitas por Categoria",
  "Despesas por Categoria",
  "Rentabilidade por Produto",
  "Rentabilidade por Vendedor",
  "Mapa de Contas",
];

const RelatoriosFinanceiros: React.FC = () => {
  const {
    fetchFluxoCaixaRelatorio,
    fetchResumoMensalRelatorio,
    dashboard,
    loading,
  } = useFinanceiro();

  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const [fluxoInicio, setFluxoInicio] = useState<string>("");
  const [fluxoFim, setFluxoFim] = useState<string>("");
  const [fluxoData, setFluxoData] = useState<any[]>([]);

  const [mesResumo, setMesResumo] = useState<string>("");
  const [resumoMensal, setResumoMensal] = useState<{
    mes: string;
    totalEntradas: number;
    totalSaidas: number;
    resultado: number;
  } | null>(null);

  async function handleGerarFluxo() {
    if (!fluxoInicio || !fluxoFim) {
      return;
    }
    const data = await fetchFluxoCaixaRelatorio({
      inicio: fluxoInicio,
      fim: fluxoFim,
    });

    const agrupado: Record<string, { data: string; entradas: number; saidas: number }> = {};

    data.forEach((mov: any) => {
      const chave = mov.data.substring(0, 10);
      if (!agrupado[chave]) {
        agrupado[chave] = { data: chave, entradas: 0, saidas: 0 };
      }
      if (mov.tipo === "ENTRADA") {
        agrupado[chave].entradas += Number(mov.valor);
      } else if (mov.tipo === "SAIDA") {
        agrupado[chave].saidas += Number(mov.valor);
      }
    });

    const arr = Object.values(agrupado).sort((a, b) =>
      a.data.localeCompare(b.data)
    );

    setFluxoData(arr);
  }

  async function handleGerarResumoMensal() {
    if (!mesResumo) return;
    const data = await fetchResumoMensalRelatorio(mesResumo);
    setResumoMensal(data);
  }

  function renderFluxoCaixa() {
    return (
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-primary" />
              Fluxo de Caixa Consolidado
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Informe o periodo para analisar entradas e saidas dia a dia
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">
                Data inicial
              </label>
              <Input
                type="date"
                value={fluxoInicio}
                onChange={(e) => setFluxoInicio(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">
                Data final
              </label>
              <Input
                type="date"
                value={fluxoFim}
                onChange={(e) => setFluxoFim(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleGerarFluxo} disabled={loading}>
                Gerar
              </Button>
            </div>
          </div>

          {fluxoData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum dado carregado. Informe o periodo e clique em Gerar.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fluxoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      `R$ ${value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}`
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="entradas"
                    name="Entradas"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="saidas"
                    name="Saidas"
                    stroke="#dc2626"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function renderResumoMensal() {
    return (
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w 5 h 5 text primary" />
              Resumo Financeiro Mensal
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Selecione o mes para ver entradas, saidas e resultado
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium mb-1">
                Mes de referencia
              </label>
              <Input
                type="month"
                value={mesResumo}
                onChange={(e) => setMesResumo(e.target.value)}
              />
            </div>
            <Button onClick={handleGerarResumoMensal} disabled={loading}>
              Gerar
            </Button>
          </div>

          {resumoMensal ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                  <p className="text-xs text-muted-foreground">Entradas</p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    R$ {resumoMensal.totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30">
                  <p className="text-xs text-muted-foreground">Saidas</p>
                  <p className="text-xl font-bold text-rose-700 dark:text-rose-300">
                    R$ {resumoMensal.totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                  <p className="text-xs text-muted-foreground">Resultado</p>
                  <p
                    className={
                      "text-xl font-bold " +
                      (resumoMensal.resultado >= 0
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300")
                    }
                  >
                    R$ {resumoMensal.resultado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="h-72 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        nome: "Entradas",
                        valor: resumoMensal.totalEntradas,
                      },
                      {
                        nome: "Saidas",
                        valor: resumoMensal.totalSaidas,
                      },
                      {
                        nome: "Resultado",
                        valor: resumoMensal.resultado,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) =>
                        `R$ ${value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}`
                      }
                    />
                    <Bar dataKey="valor" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-4">
              Nenhum resumo carregado. Selecione o mes e clique em Gerar.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  function renderEmDesenvolvimento(titulo: string) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Conteudo do relatorio {titulo} esta em desenvolvimento.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline">Exportar PDF</Button>
            <Button variant="outline">Exportar CSV</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderReport = () => {
    if (!selectedReport) {
      return (
        <Card>
          <CardContent className="py-10">
            <p className="text-muted-foreground">
              Selecione um relatorio ao lado para começar a analise financeira.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (selectedReport === "Fluxo de Caixa Consolidado") {
      return renderFluxoCaixa();
    }

    if (selectedReport === "Resumo Financeiro Mensal") {
      return renderResumoMensal();
    }

    return renderEmDesenvolvimento(selectedReport);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      <div
        className={
          EM_CONSTRUCAO
            ? "p-4 space-y-4 blur-md pointer-events-none select-none"
            : "p-4 space-y-4"
        }
      >
        <h1 className="text-2xl font-bold">Relatorios Financeiros</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Relatorios</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-2">
                {reports.map((report) => (
                  <Button
                    key={report}
                    variant={selectedReport === report ? "default" : "ghost"}
                    onClick={() => setSelectedReport(report)}
                    className="w-full justify-start"
                  >
                    {report}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">{renderReport()}</div>
        </div>
      </div>

      {EM_CONSTRUCAO && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md">
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-gray-800">Em construcao</h2>
          <p className="mt-2 text-gray-700 text-sm max-w-xs text-center">
            Estamos desenvolvendo relatorios completos e avancados para o modulo financeiro.
          </p>
        </div>
      )}
    </div>
  );
};

export default RelatoriosFinanceiros;
