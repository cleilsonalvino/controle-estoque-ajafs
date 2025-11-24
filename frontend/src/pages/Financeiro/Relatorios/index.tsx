// src/pages/Financeiro/Relatorios/index.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const EM_CONSTRUCAO = true;

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
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const renderReport = () => {
    if (!selectedReport) {
      return <p className="text-muted-foreground">Selecione um relatório para começar.</p>;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{selectedReport}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Conteúdo do relatório <strong>{selectedReport}</strong> (Em desenvolvimento).
          </p>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline">Exportar PDF</Button>
            <Button variant="outline">Exportar CSV</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)]">

      {/* ====== CONTEÚDO PRINCIPAL (com blur se em construção) ====== */}
      <div
        className={
          EM_CONSTRUCAO
            ? "p-4 space-y-4 blur-md pointer-events-none select-none"
            : "p-4 space-y-4"
        }
      >
        <h1 className="text-2xl font-bold">Relatórios Financeiros</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Lista de relatórios */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
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

          {/* Conteúdo do relatório */}
          <div className="lg:col-span-3">{renderReport()}</div>
        </div>
      </div>

      {/* ====== OVERLAY PREMIUM EM CONSTRUÇÃO ====== */}
      {EM_CONSTRUCAO && (
        <div
          className="
            absolute inset-0 z-50
            flex flex-col items-center justify-center
            bg-white/60 backdrop-blur-md
          "
        >
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />

          <h2 className="text-3xl font-bold text-gray-800">Em Construção</h2>

          <p className="mt-2 text-gray-700 text-sm max-w-xs text-center">
            Estamos desenvolvendo relatórios completos e avançados para o módulo financeiro.
          </p>
        </div>
      )}

    </div>
  );
};

export default RelatoriosFinanceiros;
