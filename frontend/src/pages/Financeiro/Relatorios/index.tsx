// src/pages/Financeiro/Relatorios/index.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      return <p>Selecione um relatório para começar.</p>;
    }
    // Here we would render the specific report component
    return (
        <Card>
            <CardHeader>
                <CardTitle>{selectedReport}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Conteúdo do relatório de {selectedReport} (Em desenvolvimento).</p>
                <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline">Exportar para PDF</Button>
                    <Button variant="outline">Exportar para CSV</Button>
                </div>
            </CardContent>
        </Card>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Relatórios Financeiros</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
        <div className="lg:col-span-3">
            {renderReport()}
        </div>
      </div>
    </div>
  );
};

export default RelatoriosFinanceiros;
