import { Prisma, PrismaClient, FinanceiroStatusConta } from "@prisma/client";
import { CustomError } from "../../shared/errors";

import { DashboardFinanceiro } from "./financeiro.types";
import {
  typeCreateCategoriaFinanceiraDTO, // 💡 CORREÇÃO
  typeUpdateCategoriaFinanceiraDTO, // 💡 CORREÇÃO
  typeCreateContaBancariaDTO, // 💡 CORREÇÃO
  typeUpdateContaBancariaDTO, // 💡 CORREÇÃO
  typeTransferenciaEntreContasDTO, // 💡 CORREÇÃO
  typeCreateMovimentacaoFinanceiraDTO, // 💡 CORREÇÃO
  typeUpdateMovimentacaoFinanceiraDTO, // 💡 CORREÇÃO
  typeCreateContaPagarDTO, // 💡 CORREÇÃO
  typeUpdateContaPagarDTO, // 💡 CORREÇÃO
  typeMarcarContaPagaDTO, // 💡 CORREÇÃO
  typeCreateContaReceberDTO, // 💡 CORREÇÃO
  typeUpdateContaReceberDTO, // 💡 CORREÇÃO
  typeMarcarContaRecebidaDTO, // 💡 CORREÇÃO
} from "./financeiro.dto";
import {
  startOfMonth,
  endOfMonth,
  addDays,
  subMonths,
} from "date-fns";

const prisma = new PrismaClient();

// =================================
// HELPERS
// =================================

type SecuredModelName =
  | "categoriaFinanceira"
  | "contaBancaria"
  | "movimentacaoFinanceira"
  | "contaPagar"
  | "contaReceber";

async function checkEmpresa(
  id: string,
  empresaId: string,
  model: SecuredModelName
) {
  const repo = (prisma as any)[model] as {
    findUnique: (args: any) => Promise<any>;
  };

  if (!repo) {
    throw new CustomError(
      `Model "${model}" não encontrado no PrismaClient.`,
      500
    );
  }

  const record = await repo.findUnique({ where: { id } });

  if (!record) {
    throw new CustomError(`Registro não encontrado.`, 404);
  }

  if (record.empresaId !== empresaId) {
    throw new CustomError("Acesso não autorizado.", 403);
  }

  return record;
}

// Helper interno para criar movimentação + ajustar saldo dentro de uma transação
async function createMovimentacaoWithSaldo(
  tx: Prisma.TransactionClient,
  empresaId: string,
  data: typeCreateMovimentacaoFinanceiraDTO // 💡 CORREÇÃO (usando o tipo inferido)
) {
  const op =
    data.tipo === "ENTRADA"
      ? { increment: data.valor }
      : { decrement: data.valor };

  // Opcional: validar saldo antes de debitar
  if (data.tipo === "SAIDA") {
    const conta = await tx.contaBancaria.findUnique({
      where: { id: data.contaBancariaId },
    });

    if (!conta) {
      throw new CustomError("Conta bancária não encontrada.", 404);
    }

    if (conta.saldoAtual.toNumber() < data.valor) {
      throw new CustomError("Saldo insuficiente na conta de origem.", 400);
    }
  }

  await tx.contaBancaria.update({
    where: { id: data.contaBancariaId },
    data: { saldoAtual: op },
  });

  return tx.movimentacaoFinanceira.create({
    data: { ...data, empresaId },
  });
}

// =================================
// DASHBOARD SERVICE
// =================================

export const dashboardFinanceiroService = {
  async getDashboard(empresaId: string): Promise<DashboardFinanceiro> {
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);
    const proximos7Dias = addDays(hoje, 7);

    const [
      totalEntradas,
      totalSaidas,
      saldoContas,
      pagar7dias,
      receber7dias,
      ultimasMov,
      fluxoCaixa,
      despesasCat,
      receitasCat,
    ] = await Promise.all([
      prisma.movimentacaoFinanceira.aggregate({
        _sum: { valor: true },
        where: {
          empresaId,
          tipo: "ENTRADA",
          data: { gte: inicioMes, lte: fimMes },
        },
      }),
      prisma.movimentacaoFinanceira.aggregate({
        _sum: { valor: true },
        where: {
          empresaId,
          tipo: "SAIDA",
          data: { gte: inicioMes, lte: fimMes },
        },
      }),
      prisma.contaBancaria.aggregate({
        _sum: { saldoAtual: true },
        where: { empresaId, ativo: true },
      }),
      prisma.contaPagar.findMany({
        where: {
          empresaId,
          status: "PENDENTE",
          dataVencimento: { lte: proximos7Dias },
        },
        orderBy: { dataVencimento: "asc" },
      }),
      prisma.contaReceber.findMany({
        where: {
          empresaId,
          status: "PENDENTE",
          dataVencimento: { lte: proximos7Dias },
        },
        orderBy: { dataVencimento: "asc" },
      }),
      prisma.movimentacaoFinanceira.findMany({
        where: { empresaId },
        orderBy: { criadoEm: "desc" },
        take: 5,
        include: { categoria: true, contaBancaria: true },
      }),
      getFluxoCaixaMensal(empresaId),
      getDespesasPorCategoria(empresaId, inicioMes, fimMes),
      getReceitasPorCategoria(empresaId, inicioMes, fimMes),
    ]);

    const totalEntradasMes = Number(totalEntradas._sum.valor) || 0;
    const totalSaidasMes = Number(totalSaidas._sum.valor) || 0;

    return {
      totalEntradasMes,
      totalSaidasMes,
      lucroLiquidoMes: totalEntradasMes - totalSaidasMes,
      saldoTotalContas: Number(saldoContas._sum.saldoAtual) || 0,
      contasPagarProximos7Dias: pagar7dias,
      contasReceberProximos7Dias: receber7dias,
      ultimasMovimentacoes: ultimasMov,
      fluxoCaixaMensal: fluxoCaixa,
      despesasPorCategoria: despesasCat,
      receitasPorCategoria: receitasCat,
    };
  },
};

async function getFluxoCaixaMensal(empresaId: string) {
  const meses = Array.from({ length: 6 }).map((_, i) =>
    subMonths(new Date(), i)
  );
  const fluxo: {
    mes: string;
    entradas: number;
    saidas: number;
  }[] = [];

  for (const mes of meses) {
    const inicio = startOfMonth(mes);
    const fim = endOfMonth(mes);
    const [entradas, saidas] = await Promise.all([
      prisma.movimentacaoFinanceira.aggregate({
        _sum: { valor: true },
        where: {
          empresaId,
          tipo: "ENTRADA",
          data: { gte: inicio, lte: fim },
        },
      }),
      prisma.movimentacaoFinanceira.aggregate({
        _sum: { valor: true },
        where: {
          empresaId,
          tipo: "SAIDA",
          data: { gte: inicio, lte: fim },
        },
      }),
    ]);

    fluxo.push({
      mes: inicio.toISOString().substring(0, 7),
      entradas: Number(entradas._sum.valor) || 0,
      saidas: Number(saidas._sum.valor) || 0,
    });
  }

  return fluxo.reverse();
}

async function getDespesasPorCategoria(
  empresaId: string,
  inicio: Date,
  fim: Date
) {
  const result = await prisma.movimentacaoFinanceira.groupBy({
    by: ["categoriaId"],
    _sum: { valor: true },
    where: {
      empresaId,
      tipo: "SAIDA",
      data: { gte: inicio, lte: fim },
      categoriaId: { not: undefined },
    },
  });

  const ids = result
    .map((r) => r.categoriaId)
    .filter((id): id is string => !!id);

  if (!ids.length) return [];

  const categorias = await prisma.categoriaFinanceira.findMany({
    where: { id: { in: ids } },
  });

  const mapCat = new Map(categorias.map((c) => [c.id, c.nome]));

  return result.map((r) => ({
    categoria: mapCat.get(r.categoriaId as string) || "Desconhecida",
    total: Number(r._sum.valor) || 0,
  }));
}

async function getReceitasPorCategoria(
  empresaId: string,
  inicio: Date,
  fim: Date
) {
  const result = await prisma.movimentacaoFinanceira.groupBy({
    by: ["categoriaId"],
    _sum: { valor: true },
    where: {
      empresaId,
      tipo: "ENTRADA",
      data: { gte: inicio, lte: fim },
      categoriaId: { not: undefined },
    },
  });

  const ids = result
    .map((r) => r.categoriaId)
    .filter((id): id is string => !!id);

  if (!ids.length) return [];

  const categorias = await prisma.categoriaFinanceira.findMany({
    where: { id: { in: ids } },
  });

  const mapCat = new Map(categorias.map((c) => [c.id, c.nome]));

  return result.map((r) => ({
    categoria: mapCat.get(r.categoriaId as string) || "Desconhecida",
    total: Number(r._sum.valor) || 0,
  }));
}

// =================================
// CATEGORIA FINANCEIRA SERVICE
// =================================

export const categoriaFinanceiraService = {
  list: (empresaId: string, tipo?: "ENTRADA" | "SAIDA") =>
    prisma.categoriaFinanceira.findMany({
      where: { empresaId, tipo, ativo: true },
      orderBy: { nome: "asc" },
    }),

  create: (empresaId: string, data: typeCreateCategoriaFinanceiraDTO) => // 💡 CORREÇÃO
    prisma.categoriaFinanceira.create({ data: { ...data, empresaId } }),

  update: async (
    id: string,
    empresaId: string,
    data: typeUpdateCategoriaFinanceiraDTO // 💡 CORREÇÃO
  ) => {
    await checkEmpresa(id, empresaId, "categoriaFinanceira");
    return prisma.categoriaFinanceira.update({ where: { id }, data });
  },

  archive: async (id: string, empresaId: string) => {
    await checkEmpresa(id, empresaId, "categoriaFinanceira");
    return prisma.categoriaFinanceira.update({
      where: { id },
      data: { ativo: false },
    });
  },
};

// =================================
// CONTA BANCÁRIA SERVICE
// =================================

export const contaBancariaService = {
  list: (empresaId: string) =>
    prisma.contaBancaria.findMany({
      where: { empresaId, ativo: true },
      orderBy: { nome: "asc" },
    }),

  create: (empresaId: string, data: typeCreateContaBancariaDTO) => // 💡 CORREÇÃO
    prisma.contaBancaria.create({
      data: { ...data, saldoAtual: data.saldoInicial, empresaId,  },
    }),

  update: async (
    id: string,
    empresaId: string,
    data: typeUpdateContaBancariaDTO // 💡 CORREÇÃO
  ) => {
    await checkEmpresa(id, empresaId, "contaBancaria");
    return prisma.contaBancaria.update({ where: { id }, data });
  },

  delete: async (id: string, empresaId: string) => {
    await checkEmpresa(id, empresaId, "contaBancaria");
    const movs = await prisma.movimentacaoFinanceira.count({
      where: { contaBancariaId: id },
    });
    if (movs > 0) {
      throw new CustomError(
        "Não é possível excluir conta com movimentações.",
        400
      );
    }
    return prisma.contaBancaria.delete({ where: { id } });
  },

  transferir: async (
    empresaId: string,
    data: typeTransferenciaEntreContasDTO // 💡 CORREÇÃO
  ) => {
    const { contaOrigemId, contaDestinoId, valor, ...rest } = data;

    if (contaOrigemId === contaDestinoId) {
      throw new CustomError(
        "Contas de origem e destino não podem ser iguais.",
        400
      );
    }

    const [contaOrigem, contaDestino] = await Promise.all([
      checkEmpresa(contaOrigemId, empresaId, "contaBancaria"),
      checkEmpresa(contaDestinoId, empresaId, "contaBancaria"),
    ]);

    const catSaida =
      (await prisma.categoriaFinanceira.findFirst({
        where: {
          empresaId,
          nome: "Transferência entre Contas",
          tipo: "SAIDA",
        },
      })) ||
      (await prisma.categoriaFinanceira.create({
        data: {
          empresaId,
          nome: "Transferência entre Contas",
          tipo: "SAIDA",
          ativo: true,
        } as any,
      }));

    const catEntrada =
      (await prisma.categoriaFinanceira.findFirst({
        where: {
          empresaId,
          nome: "Transferência entre Contas",
          tipo: "ENTRADA",
        },
      })) ||
      (await prisma.categoriaFinanceira.create({
        data: {
          empresaId,
          nome: "Transferência entre Contas",
          tipo: "ENTRADA",
          ativo: true,
        } as any,
      }));

    return prisma.$transaction(async (tx) => {
      // Debita origem
      await tx.contaBancaria.update({
        where: { id: contaOrigemId },
        data: { saldoAtual: { decrement: valor } },
      });

      // Verifica se ficou negativo
      const contaOrigemAtualizada = await tx.contaBancaria.findUnique({
        where: { id: contaOrigemId },
      });

      if (!contaOrigemAtualizada) {
        throw new CustomError("Conta de origem não encontrada.", 404);
      }

      if (contaOrigemAtualizada.saldoAtual.lessThan(0)) {
        throw new CustomError(
          "Saldo insuficiente na conta de origem para transferência.",
          400
        );
      }

      // Credita destino
      await tx.contaBancaria.update({
        where: { id: contaDestinoId },
        data: { saldoAtual: { increment: valor } },
      });

      const movSaida = await tx.movimentacaoFinanceira.create({
        data: {
          ...rest,
          tipo: "SAIDA",
          valor,
          empresaId,
          contaBancariaId: contaOrigemId,
          categoriaId: catSaida.id,
          descricao: `Transferência para ${contaDestino.nome}`,
        },
      });

      const movEntrada = await tx.movimentacaoFinanceira.create({
        data: {
          ...rest,
          tipo: "ENTRADA",
          valor,
          empresaId,
          contaBancariaId: contaDestinoId,
          categoriaId: catEntrada.id,
          descricao: `Transferência de ${contaOrigem.nome}`,
        },
      });

      return { movSaida, movEntrada };
    });
  },
};

// =================================
// MOVIMENTAÇÃO FINANCEIRA SERVICE
// =================================

export const movimentacaoFinanceiraService = {
  list: (empresaId: string, filters: any) =>
    prisma.movimentacaoFinanceira.findMany({
      where: { empresaId, ...filters },
      include: { categoria: true, contaBancaria: true },
      orderBy: { data: "desc" },
    }),

  create: (empresaId: string, data: typeCreateMovimentacaoFinanceiraDTO) => { // 💡 CORREÇÃO
    return prisma.$transaction((tx) =>
      createMovimentacaoWithSaldo(tx, empresaId, data)
    );
  },

  update: async (
    id: string,
    empresaId: string,
    data: typeUpdateMovimentacaoFinanceiraDTO // 💡 CORREÇÃO
  ) => {
    const movOriginal = await checkEmpresa(
      id,
      empresaId,
      "movimentacaoFinanceira"
    );

    return prisma.$transaction(async (tx) => {
      const valorOriginal = movOriginal.valor as any;
      const tipoOriginal = movOriginal.tipo as "ENTRADA" | "SAIDA";
      const contaOriginalId = movOriginal.contaBancariaId as string;

      // Reverte movimentação original
      const opReversao =
        tipoOriginal === "ENTRADA"
          ? { decrement: valorOriginal }
          : { increment: valorOriginal };

      await tx.contaBancaria.update({
        where: { id: contaOriginalId },
        data: { saldoAtual: opReversao },
      });

      // Aplica a nova movimentação
      const novoValor = data.valor ?? valorOriginal;
      const novoTipo = (data.tipo ?? tipoOriginal) as "ENTRADA" | "SAIDA";
      const novaContaId = data.contaBancariaId ?? contaOriginalId;

      const opNova =
        novoTipo === "ENTRADA"
          ? { increment: novoValor }
          : { decrement: novoValor };

      await tx.contaBancaria.update({
        where: { id: novaContaId },
        data: { saldoAtual: opNova },
      });

      return tx.movimentacaoFinanceira.update({
        where: { id },
        data,
      });
    });
  },

  remove: async (id: string, empresaId: string) => {
    const mov = await checkEmpresa(id, empresaId, "movimentacaoFinanceira");

    return prisma.$transaction(async (tx) => {
      const op =
        mov.tipo === "ENTRADA"
          ? { decrement: mov.valor }
          : { increment: mov.valor };

      await tx.contaBancaria.update({
        where: { id: mov.contaBancariaId },
        data: { saldoAtual: op },
      });

      return tx.movimentacaoFinanceira.delete({ where: { id } });
    });
  },
};

// =================================
// CONTA A PAGAR SERVICE
// =================================

export const contaPagarService = {
  list: (empresaId: string, filters: any) =>
    prisma.contaPagar.findMany({
      where: { empresaId, ...filters },
      include: { categoria: true },
      orderBy: { dataVencimento: "asc" },
    }),

  create: (empresaId: string, data: typeCreateContaPagarDTO) => // 💡 CORREÇÃO
    prisma.contaPagar.create({ data: { ...data, empresaId } }),

  update: async (
    id: string,
    empresaId: string,
    data: typeUpdateContaPagarDTO // 💡 CORREÇÃO
  ) => {
    await checkEmpresa(id, empresaId, "contaPagar");
    return prisma.contaPagar.update({ where: { id }, data });
  },

  delete: async (id: string, empresaId: string) => {
    await checkEmpresa(id, empresaId, "contaPagar");
    return prisma.contaPagar.delete({ where: { id } });
  },

  marcarComoPago: async (
    id: string,
    empresaId: string,
    data: typeMarcarContaPagaDTO // 💡 CORREÇÃO
  ) => {
    const conta = await checkEmpresa(id, empresaId, "contaPagar");

    if (conta.status === "PAGO") {
      throw new CustomError("Esta conta já foi paga.", 400);
    }

    return prisma.$transaction(async (tx) => {
      await createMovimentacaoWithSaldo(tx, empresaId, {
        tipo: "SAIDA",
        valor: data.valorPago,
        data: data.dataPagamento,
        categoriaId: conta.categoriaId,
        contaBancariaId: data.contaBancariaId,
        descricao: `Pagamento: ${conta.descricao}`,
        metodoPagamento: data.metodoPagamento,
        status: "LIQUIDADA",
      });

      return tx.contaPagar.update({
        where: { id },
        data: {
          status: "PAGO",
          dataPagamento: data.dataPagamento,
          valorPago: { increment: data.valorPago },
          contaBancariaId: data.contaBancariaId,
        },
      });
    });
  },
};

// =================================
// CONTA A RECEBER SERVICE
// =================================

export const contaReceberService = {
  list: (empresaId: string, filters: any) =>
    prisma.contaReceber.findMany({
      where: { empresaId, ...filters },
      include: { categoria: true, cliente: true },
      orderBy: { dataVencimento: "asc" },
    }),

  create: (empresaId: string, data: typeCreateContaReceberDTO) => // 💡 CORREÇÃO
    prisma.contaReceber.create({ data: { ...data, empresaId } }),

  update: async (
    id: string,
    empresaId: string,
    data: typeUpdateContaReceberDTO // 💡 CORREÇÃO
  ) => {
    await checkEmpresa(id, empresaId, "contaReceber");
    return prisma.contaReceber.update({ where: { id }, data });
  },

  delete: async (id: string, empresaId: string) => {
    await checkEmpresa(id, empresaId, "contaReceber");
    return prisma.contaReceber.delete({ where: { id } });
  },

  marcarComoRecebido: async (
    id: string,
    empresaId: string,
    data: typeMarcarContaRecebidaDTO // 💡 CORREÇÃO
  ) => {
    const conta = await checkEmpresa(id, empresaId, "contaReceber");

    if (conta.status === "RECEBIDO") {
      throw new CustomError("Esta conta já foi recebida.", 400);
    }

    return prisma.$transaction(async (tx) => {
      await createMovimentacaoWithSaldo(tx, empresaId, {
        tipo: "ENTRADA",
        valor: data.valorRecebido,
        data: data.dataRecebimento,
        categoriaId: conta.categoriaId,
        contaBancariaId: data.contaBancariaId,
        descricao: `Recebimento: ${conta.descricao}`,
        metodoPagamento: data.metodoPagamento,
        status: "LIQUIDADA",
        clienteId: conta.clienteId,
        vendaId: conta.vendaId,
      });

      return tx.contaReceber.update({
        where: { id },
        data: {
          status: FinanceiroStatusConta.PAGO,
          dataRecebimento: data.dataRecebimento,
          valorRecebido: { increment: data.valorRecebido },
          contaBancariaId: data.contaBancariaId,
        },
      });
    });
  },
};

// =================================
// RELATÓRIOS SERVICE
// =================================

export const relatoriosFinanceiroService = {
  fluxoCaixa: (empresaId: string, inicio: Date, fim: Date) => {
    return prisma.movimentacaoFinanceira.findMany({
      where: { empresaId, data: { gte: inicio, lte: fim } },
      orderBy: { data: "asc" },
    });
  },

  resumoMensal: async (empresaId: string, mes: Date) => {
    const inicio = startOfMonth(mes);
    const fim = endOfMonth(mes);

    const [entradas, saidas] = await Promise.all([
      prisma.movimentacaoFinanceira.aggregate({
        _sum: { valor: true },
        where: {
          empresaId,
          tipo: "ENTRADA",
          data: { gte: inicio, lte: fim },
        },
      }),
      prisma.movimentacaoFinanceira.aggregate({
        _sum: { valor: true },
        where: {
          empresaId,
          tipo: "SAIDA",
          data: { gte: inicio, lte: fim },
        },
      }),
    ]);

    const totalEntradas = Number(entradas._sum.valor) || 0;
    const totalSaidas = Number(saidas._sum.valor) || 0;

    return {
      mes: mes.toISOString().substring(0, 7),
      totalEntradas,
      totalSaidas,
      resultado: totalEntradas - totalSaidas,
    };
  },

  despesasPorCategoria: (
    empresaId: string,
    inicio: Date,
    fim: Date
  ) => getDespesasPorCategoria(empresaId, inicio, fim),

  receitasPorCategoria: (
    empresaId: string,
    inicio: Date,
    fim: Date
  ) => getReceitasPorCategoria(empresaId, inicio, fim),
};