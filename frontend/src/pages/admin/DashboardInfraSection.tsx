// src/pages/admin/DashboardInfraSection.tsx
import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type InfraMetrics = {
  apiStatus: string;
  apiLatenciaMs: number;
  apiUptimeSegundos: number;
  totalRequests: number;
  totalErrors: number;
  requestsUltimosMinutos: number;
  cpuLoad1m: number;
  cpuLoad5m: number;
  cpuLoad15m: number;
  cpuUsagePercent: number;
  nucleosCPU: number;
  memoriaUsadaMB: number;
  memoriaTotalMB: number;
  memoriaLivreMB: number;
  sistemaOperacional: string;
  arquitetura: string;
  hostname: string;
  versaoNode: string;
  ambienteExecucao: string;
};

// Garante número SEM quebrar a tela
const safeNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export function DashboardInfraSection() {
  const [apiInfo, setApiInfo] = useState<InfraMetrics | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfra = async () => {
      try {
        setApiLoading(true);
        setApiError(null);

        const { data } = await api.get("/health/infra");
        console.log("Resposta /health/infra:", data);

        // sua rota já retorna diretamente o objeto de métricas
        setApiInfo(data.data as InfraMetrics);
      } catch (error) {
        console.error("Erro ao carregar métricas de infraestrutura:", error);
        setApiError("Erro ao carregar métricas de infraestrutura.");
      } finally {
        setApiLoading(false);
      }
    };

    fetchInfra();
  }, []);

  if (apiLoading) {
    return (
      <section id="infra" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-600" />
          Infraestrutura e saude do sistema
        </h2>
        <p className="text-sm text-muted-foreground">
          Carregando informacoes de infraestrutura...
        </p>
      </section>
    );
  }

  if (apiError || !apiInfo) {
    return (
      <section id="infra" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-600" />
          Infraestrutura e saude do sistema
        </h2>
        <p className="text-sm text-red-500">
          {apiError ?? "Nao foi possivel carregar as metricas da API."}
        </p>
      </section>
    );
  }

  // valores já "seguros"
  const latencia = safeNumber(apiInfo.apiLatenciaMs);
  const usoCpu = safeNumber(apiInfo.cpuUsagePercent);
  const memUsada = safeNumber(apiInfo.memoriaUsadaMB);
  const memTotal = safeNumber(apiInfo.memoriaTotalMB, 1); // evita divisao por zero
  const memLivre = safeNumber(apiInfo.memoriaLivreMB);
  const uptimeSegundos = safeNumber(apiInfo.apiUptimeSegundos);
  const uptimeMinutos = Math.floor(uptimeSegundos / 60);
  const uptimeSegundosRest = uptimeSegundos % 60;
  const memPercent = Math.min((memUsada / memTotal) * 100, 100);

  return (
    <section id="infra" className="mt-10 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Cpu className="w-5 h-5 text-emerald-600" />
        Infraestrutura e saude do sistema
      </h2>

      {/* Cartoes principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status da API */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status da API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiInfo.apiStatus === "OK"
                    ? "bg-emerald-500"
                    : apiInfo.apiStatus === "INSTAVEL"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              />
              <span className="font-semibold text-sm">
                {apiInfo.apiStatus}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Status informado pela rota /health/infra
            </p>
          </CardContent>
        </Card>

        {/* Latencia media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Latencia media</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold flex items-center gap-1">
              {latencia.toFixed(2)}
              <span className="text-xs text-muted-foreground">ms</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Tempo medio de resposta das principais rotas
            </p>
          </CardContent>
        </Card>

        {/* Requisicoes totais na vida da instancia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Requisicoes totais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {safeNumber(apiInfo.totalRequests)}
            </p>
            <p className="text-xs text-muted-foreground">
              Desde que o servidor foi iniciado
            </p>
          </CardContent>
        </Card>

        {/* Erros acumulados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Erros registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {safeNumber(apiInfo.totalErrors)}
            </p>
            <p className="text-xs text-muted-foreground">
              Quantidade de erros capturados no backend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Linha com CPU e memoria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* CPU */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uso de CPU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uso atual</span>
              <span className="font-semibold">
                {usoCpu.toFixed(2)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{
                  width: `${Math.min(usoCpu, 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Cargas recentes: {safeNumber(apiInfo.cpuLoad1m)} /{" "}
              {safeNumber(apiInfo.cpuLoad5m)} /{" "}
              {safeNumber(apiInfo.cpuLoad15m)} (1m / 5m / 15m)
            </p>
            <p className="text-xs text-muted-foreground">
              Nucleos disponiveis: {safeNumber(apiInfo.nucleosCPU)}
            </p>
          </CardContent>
        </Card>

        {/* Memoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uso de memoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Em uso</span>
              <span className="font-semibold">
                {memUsada.toFixed(0)} MB
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${memPercent}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Total: {memTotal.toFixed(0)} MB
            </p>
            <p className="text-xs text-muted-foreground">
              Livre aproximado: {memLivre.toFixed(0)} MB
            </p>
          </CardContent>
        </Card>

        {/* Uptime e ambiente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ambiente e uptime</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-lg font-semibold">
                {uptimeMinutos}m {uptimeSegundosRest}s
              </p>
            </div>

            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Servidor</p>
              <p className="text-sm font-medium">
                {apiInfo.hostname} ({apiInfo.sistemaOperacional}/
                {apiInfo.arquitetura})
              </p>
            </div>

            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Node</p>
              <p className="text-sm font-medium">
                {apiInfo.versaoNode}{" "}
                <span className="text-xs text-muted-foreground">
                  ambiente {apiInfo.ambienteExecucao}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
