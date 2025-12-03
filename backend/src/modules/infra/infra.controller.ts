// src/modules/infra/infra.controller.ts
import { Request, Response, NextFunction } from "express";
import os from "os";

// ============================================
// Tipagens das metricas de infraestrutura
// ============================================
export interface InfraMetrics {
  apiStatus: "OK" | "INSTAVEL" | "OFFLINE";

  // Latencia e tempo de atividade
  apiLatenciaMs: number;
  apiUptimeSegundos: number;

  // Requisicoes
  totalRequests: number;
  totalErrors: number;
  requestsUltimosMinutos: number | null;

  // CPU
  cpuLoad1m: number;
  cpuLoad5m: number;
  cpuLoad15m: number;
  cpuUsagePercent: number | null;
  nucleosCPU: number;

  // Memoria
  memoriaUsadaMB: number;
  memoriaTotalMB: number;
  memoriaLivreMB: number;

  // Sistema operacional
  sistemaOperacional: string;
  arquitetura: string;
  hostname: string;

  // Informacoes extras que podem ser uteis para dashboard
  versaoNode: string;
  ambienteExecucao: string;
}

// ============================================
// Contadores globais em memoria
// ============================================

let totalRequests = 0;
let totalErrors = 0;

// Opcional: controle simples de requests em janela recente
let requestsJanela = 0;
let ultimaJanelaTimestamp = Date.now();
const JANELA_MS = 60_000; // sessenta segundos

// ============================================
// Middleware para contar requests e erros
// ============================================

export function infraRequestCounter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  totalRequests += 1;
  requestsJanela += 1;

  // Reseta janela de contagem a cada sessenta segundos
  const agora = Date.now();
  if (agora - ultimaJanelaTimestamp > JANELA_MS) {
    ultimaJanelaTimestamp = agora;
    requestsJanela = 1;
  }

  // Intercepta finalizacao para detectar erro por status
  const originalStatus = res.status.bind(res);
  res.status = (code: number) => {
    if (code >= 500) {
      totalErrors += 1;
    }
    return originalStatus(code);
  };

  next();
}

// ============================================
// Funcoes auxiliares
// ============================================

function getMemoriaMB() {
  const memoria = process.memoryUsage();
  const total = os.totalmem();
  const livre = os.freemem();
  return {
    memoriaUsadaMB: Math.round(memoria.rss / 1024 / 1024),
    memoriaTotalMB: Math.round(total / 1024 / 1024),
    memoriaLivreMB: Math.round(livre / 1024 / 1024),
  };
}

function getLoadAverage() {
  const [load1, load5, load15] = os.loadavg();
  return {
    cpuLoad1m: load1,
    cpuLoad5m: load5,
    cpuLoad15m: load15,
  };
}

// Calcula uso aproximado de CPU com pequena amostragem
async function getCPUUsagePercentAmostra(
  intervaloMs: number = 250
): Promise<number> {
  const inicio = os.cpus();

  const idleInicio = inicio.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalInicio = inicio.reduce(
    (acc, cpu) =>
      acc +
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq,
    0
  );

  // espera um pouco e mede de novo
  await new Promise((resolve) => setTimeout(resolve, intervaloMs));

  const fim = os.cpus();
  const idleFim = fim.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalFim = fim.reduce(
    (acc, cpu) =>
      acc +
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq,
    0
  );

  const idleDiff = idleFim - idleInicio;
  const totalDiff = totalFim - totalInicio;

  if (totalDiff === 0) return 0;

  const uso = 100 - (idleDiff / totalDiff) * 100;
  return Number(uso.toFixed(2));
}

// Mede latencia artificial da propria API para ter um indicador rapido
function medirLatenciaSimples(): number {
  const inicio = process.hrtime.bigint();
  // pequena operacao para simular caminho interno
  const _ = Math.sqrt(12345);
  const fim = process.hrtime.bigint();
  const diffNs = Number(fim - inicio); // nanossegundos
  const ms = diffNs / 1_000_000;
  return Number(ms.toFixed(2));
}

// Define status da API a partir de algumas condicoes simples
function calcularStatusAPI(
  latenciaMs: number,
  cpuPercent: number | null,
  erroRate: number | null
): "OK" | "INSTAVEL" | "OFFLINE" {
  // Simples regra
  if (erroRate !== null && erroRate > 5) return "INSTAVEL";
  if (cpuPercent !== null && cpuPercent > 90) return "INSTAVEL";
  if (latenciaMs > 1000) return "INSTAVEL";

  return "OK";
}

// ============================================
// Funcao principal para montar as metricas
// ============================================

export async function coletarInfraMetrics(): Promise<InfraMetrics> {
  const apiLatenciaMs = medirLatenciaSimples();
  const uptime = Math.floor(process.uptime());

  const { memoriaUsadaMB, memoriaTotalMB, memoriaLivreMB } = getMemoriaMB();
  const { cpuLoad1m, cpuLoad5m, cpuLoad15m } = getLoadAverage();
  const nucleosCPU = os.cpus().length;

  let cpuUsagePercent: number | null = null;
  try {
    cpuUsagePercent = await getCPUUsagePercentAmostra();
  } catch {
    cpuUsagePercent = null;
  }

  // taxa aproximada de erros em porcentagem
  let erroRate: number | null = null;
  if (totalRequests > 0) {
    erroRate = Number(((totalErrors / totalRequests) * 100).toFixed(2));
  }

  const apiStatus = calcularStatusAPI(
    apiLatenciaMs,
    cpuUsagePercent,
    erroRate
  );

  const requestsUltimosMinutos =
    Date.now() - ultimaJanelaTimestamp <= JANELA_MS ? requestsJanela : 0;

  return {
    apiStatus,
    apiLatenciaMs,
    apiUptimeSegundos: uptime,
    totalRequests,
    totalErrors,
    requestsUltimosMinutos,

    cpuLoad1m,
    cpuLoad5m,
    cpuLoad15m,
    cpuUsagePercent,
    nucleosCPU,

    memoriaUsadaMB,
    memoriaTotalMB,
    memoriaLivreMB,

    sistemaOperacional: os.platform(),
    arquitetura: os.arch(),
    hostname: os.hostname(),

    versaoNode: process.version,
    ambienteExecucao: process.env.NODE_ENV || "desconhecido",
  };
}

// ============================================
// Handler Express para rota de infraestrutura
// GET /api/infra
// ============================================

export async function getInfraStatusHandler(req: Request, res: Response) {
  try {
    const metrics = await coletarInfraMetrics();
    console.log("Metricas de infraestrutura coletadas:", metrics);
    return res.json({
      message: "Metricas de infraestrutura coletadas com sucesso",
      data: metrics,
    });

    
  } catch (error) {
    console.error("Erro ao coletar metricas de infraestrutura:", error);
    return res.status(500).json({
      message: "Erro ao coletar metricas de infraestrutura",
    });
  }
}
