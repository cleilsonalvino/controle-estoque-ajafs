import { PrismaClient, TipoMovimentacao } from "@prisma/client";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

// ======================================================
// CREATE VENDA (mantido com FIFO)
// ======================================================
export const createVendaService = async (data: any) => {
  if (!data.itens || data.itens.length === 0) {
    throw new CustomError("A venda precisa ter pelo menos um item", 400);
  }

  // ==================================================
  // 1️⃣ Verificação prévia de estoque antes da venda
  // ==================================================
  for (const item of data.itens) {
    const produtoId = item.produtoId;

    const nomeProduto = await prisma.produto.findUnique({
      where: { id: produtoId },
      select: { nome: true },
    });

    const quantidadeSolicitada = Number(item.quantidade);

    const lotes = await prisma.lote.findMany({
      where: { produtoId, quantidadeAtual: { gt: 0 } },
    });

    const estoqueTotal = lotes.reduce(
      (acc, lote) => acc + Number(lote.quantidadeAtual),
      0
    );

    if (estoqueTotal < quantidadeSolicitada) {
      throw new CustomError(
        `Estoque insuficiente para o produto "${nomeProduto?.nome}". Quantidade disponível: ${estoqueTotal}, solicitada: ${quantidadeSolicitada}.`,
        400
      );
    }
  }

  // ==================================================
  // 2️⃣ Transação de criação da venda (segura)
  // ==================================================
  const venda = await prisma.$transaction(async (tx) => {
    // Calcula total
    const total = data.itens.reduce(
      (sum: number, item: { precoUnitario: any; quantidade: any }) =>
        sum + Number(item.precoUnitario) * Number(item.quantidade),
      0
    );

    // Cria venda
    const novaVenda = await tx.venda.create({
      data: {
        numero: `VND-${Date.now()}`,
        clienteId: data.clienteId || null,
        vendedorId: data.vendedorId || null,
        total,
        status: "Concluída",
        formaPagamento: data.formaPagamento || "Dinheiro",
        desconto: data.desconto || 0,
      },
    });

    // Cria itens da venda
    const itensVenda = data.itens.map((item: any) => ({
      vendaId: novaVenda.id,
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
    }));
    await tx.itemVenda.createMany({ data: itensVenda });

    // Atualiza estoque (FIFO)
    for (const item of data.itens) {
      const produtoId = item.produtoId;
      const quantidadeSolicitada = Number(item.quantidade);

      const lotes = await tx.lote.findMany({
        where: { produtoId, quantidadeAtual: { gt: 0 } },
        orderBy: { dataCompra: "asc" }, // FIFO
      });

      let restante = quantidadeSolicitada;
      for (const lote of lotes) {
        if (restante <= 0) break;

        const qtdLote = Number(lote.quantidadeAtual);
        const retirar = Math.min(qtdLote, restante);

        await tx.lote.update({
          where: { id: lote.id },
          data: { quantidadeAtual: qtdLote - retirar },
        });

        await tx.movimentacaoLote.create({
          data: {
            loteId: lote.id,
            tipo: TipoMovimentacao.SAIDA,
            quantidade: retirar,
            observacao: `Venda ${novaVenda.numero}`,
          },
        });

        restante -= retirar;
      }

      await tx.movimentacao.create({
        data: {
          produtoId,
          tipo: TipoMovimentacao.SAIDA,
          quantidade: quantidadeSolicitada,
          observacao: `Venda ${novaVenda.numero}`,
        },
      });
    }

    return novaVenda;
  });

  return venda;
};

// ======================================================
// UPDATE VENDA (agora com controle de LOTE)
// ======================================================
export const updateVendaService = async (id: string, data: any) => {
  const { itens, cliente } = data;
  if (!itens || itens.length === 0) {
    throw new CustomError("A venda precisa ter pelo menos um item", 400);
  }

  const vendaAtual = await prisma.venda.findUnique({
    where: { id },
    include: { itens: true },
  });
  if (!vendaAtual) throw new CustomError("Venda não encontrada", 404);

  const vendaAtualizada = await prisma.$transaction(async (tx) => {
    const itensAntigosMap = new Map(
      vendaAtual.itens.map((item) => [item.produtoId, item])
    );

    for (const item of itens) {
      const antigo = itensAntigosMap.get(item.produtoId);
      const quantidadeAntiga = antigo ? Number(antigo.quantidade) : 0;
      const quantidadeNova = Number(item.quantidade);
      const diff = quantidadeNova - quantidadeAntiga;

      if (diff > 0) {
        // aumenta a saída → baixa mais (FIFO)
        let restante = diff;
        const lotes = await tx.lote.findMany({
          where: { produtoId: item.produtoId, quantidadeAtual: { gt: 0 } },
          orderBy: { dataCompra: "asc" },
        });

        for (const lote of lotes) {
          if (restante <= 0) break;
          const retirar = Math.min(Number(lote.quantidadeAtual), restante);
          await tx.lote.update({
            where: { id: lote.id },
            data: { quantidadeAtual: Number(lote.quantidadeAtual) - retirar },
          });

          await tx.movimentacaoLote.create({
            data: {
              loteId: lote.id,
              tipo: TipoMovimentacao.SAIDA,
              quantidade: retirar,
              observacao: `Ajuste (+${diff}) na venda ${vendaAtual.numero}`,
            },
          });

          restante -= retirar;
        }

        await tx.movimentacao.create({
          data: {
            produtoId: item.produtoId,
            tipo: TipoMovimentacao.SAIDA,
            quantidade: diff,
            observacao: `Ajuste na venda ${vendaAtual.numero}`,
          },
        });
      } else if (diff < 0) {
        // devolve produto (LIFO)
        let devolver = Math.abs(diff);
        const lotes = await tx.lote.findMany({
          where: { produtoId: item.produtoId },
          orderBy: { dataCompra: "desc" },
        });

        for (const lote of lotes) {
          if (devolver <= 0) break;
          await tx.lote.update({
            where: { id: lote.id },
            data: { quantidadeAtual: Number(lote.quantidadeAtual) + devolver },
          });

          await tx.movimentacaoLote.create({
            data: {
              loteId: lote.id,
              tipo: TipoMovimentacao.ENTRADA,
              quantidade: devolver,
              observacao: `Ajuste (-${Math.abs(diff)}) na venda ${
                vendaAtual.numero
              }`,
            },
          });

          devolver = 0;
        }

        await tx.movimentacao.create({
          data: {
            produtoId: item.produtoId,
            tipo: TipoMovimentacao.ENTRADA,
            quantidade: Math.abs(diff),
            observacao: `Ajuste na venda ${vendaAtual.numero}`,
          },
        });
      }

      itensAntigosMap.delete(item.produtoId);
    }

    // Remove itens antigos que sumiram
    for (const [, itemRemovido] of itensAntigosMap) {
      const produtoId = itemRemovido.produtoId;
      const quantidade = Number(itemRemovido.quantidade);
      const lotes = await tx.lote.findMany({
        where: { produtoId },
        orderBy: { dataCompra: "desc" },
      });

      for (const lote of lotes) {
        await tx.lote.update({
          where: { id: lote.id },
          data: { quantidadeAtual: Number(lote.quantidadeAtual) + quantidade },
        });

        await tx.movimentacaoLote.create({
          data: {
            loteId: lote.id,
            tipo: TipoMovimentacao.ENTRADA,
            quantidade,
            observacao: `Remoção de item da venda ${vendaAtual.numero}`,
          },
        });
        break;
      }

      await tx.movimentacao.create({
        data: {
          produtoId,
          tipo: TipoMovimentacao.ENTRADA,
          quantidade,
          observacao: `Remoção de item da venda ${vendaAtual.numero}`,
        },
      });
    }

    // Atualiza itens e total
    await tx.itemVenda.deleteMany({ where: { vendaId: id } });
    await tx.itemVenda.createMany({
      data: itens.map((i: any) => ({
        vendaId: id,
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
      })),
    });

    const total = itens.reduce(
      (sum: number, i: { precoUnitario: any; quantidade: any }) =>
        sum + Number(i.precoUnitario) * Number(i.quantidade),
      0
    );

    return tx.venda.update({
      where: { id },
      data: { clienteId: cliente || vendaAtual.clienteId, total },
    });
  });

  return vendaAtualizada;
};

export const getVendasService = async () => {
  const vendas = await prisma.venda.findMany({
    include: {
      itens: {
        select: {
          produto: {
            select: {
              nome: true,
              id: true,
            },
          },
          quantidade: true,
          precoUnitario: true,
          vendaId: true,
        },
      },
      cliente: {
        select: { nome: true, id: true }, // retorna só o nome (sem id)
      },
      vendedor: {
        select: {
          nome: true,
          id: true,
        },
      },
    },
  });
  return vendas;
};

export const getVendaByIdService = async (id: string) => {
  const venda = await prisma.venda.findUnique({
    where: { id },
    include: { itens: true },
  });
  if (!venda) {
    throw new CustomError("Venda não encontrada", 404);
  }
  return venda;
};

export const deleteVendaService = async (id: string) => {
  const venda = await prisma.venda.findUnique({
    where: { id },
    include: { itens: true },
  });

  if (!venda) {
    throw new CustomError("Venda não encontrada", 404);
  }

  await prisma.$transaction(async (tx) => {
    // 1️⃣ Reverte o estoque lote a lote (LIFO)
    for (const item of venda.itens) {
      const produtoId = item.produtoId;
      const quantidade = Number(item.quantidade);
      let devolver = quantidade;

      // Busca lotes existentes do produto (mais recentes primeiro)
      const lotes = await tx.lote.findMany({
        where: { produtoId },
        orderBy: { dataCompra: "desc" }, // LIFO: devolve nos mais recentes
      });

      if (lotes.length === 0) {
        throw new CustomError(
          `Nenhum lote encontrado para o produto ${produtoId}`,
          400
        );
      }

      for (const lote of lotes) {
        if (devolver <= 0) break;

        const novaQuantidade = Number(lote.quantidadeAtual) + devolver;

        await tx.lote.update({
          where: { id: lote.id },
          data: { quantidadeAtual: novaQuantidade },
        });

        // Registra movimentação por lote
        await tx.movimentacaoLote.create({
          data: {
            loteId: lote.id,
            tipo: TipoMovimentacao.ENTRADA,
            quantidade: devolver,
            observacao: `Cancelamento da venda ${venda.numero}`,
          },
        });

        devolver = 0; // devolve tudo no lote mais recente
      }

      // Cria movimentação geral
      await tx.movimentacao.create({
        data: {
          produtoId,
          tipo: TipoMovimentacao.ENTRADA,
          quantidade,
          observacao: `Cancelamento da venda ${venda.numero}`,
        },
      });
    }

    // 2️⃣ Remove os itens da venda
    await tx.itemVenda.deleteMany({
      where: { vendaId: id },
    });

    // 3️⃣ Deleta a venda
    await tx.venda.delete({
      where: { id },
    });
  });

  return { message: "Venda deletada e estoque (lotes) ajustado com sucesso" };
};

// ======================================================
// CANCELAR VENDA (devolve estoque e mantém histórico)
// ======================================================
export const cancelVendaService = async (id: string) => {
  // 1️⃣ Busca a venda e seus itens
  const venda = await prisma.venda.findUnique({
    where: { id },
    include: { itens: true },
  });

  if (!venda) {
    throw new CustomError("Venda não encontrada", 404);
  }

  // 2️⃣ Evita cancelamento duplicado
  if (venda.status === "Cancelada") {
    throw new CustomError("Essa venda já foi cancelada anteriormente.", 400);
  }

  // 3️⃣ Inicia transação para garantir consistência
  await prisma.$transaction(async (tx) => {
    // 🔹 Devolve o estoque (LIFO)
    for (const item of venda.itens) {
      const produtoId = item.produtoId;
      const quantidade = Number(item.quantidade);
      let devolver = quantidade;

      // Busca lotes mais recentes do produto
      const lotes = await tx.lote.findMany({
        where: { produtoId },
        orderBy: { dataCompra: "desc" }, // LIFO: devolve nos mais recentes
      });

      if (lotes.length === 0) {
        throw new CustomError(
          `Nenhum lote encontrado para o produto ${produtoId}`,
          400
        );
      }

      for (const lote of lotes) {
        if (devolver <= 0) break;

        const novaQuantidade = Number(lote.quantidadeAtual) + devolver;

        // Atualiza o estoque do lote
        await tx.lote.update({
          where: { id: lote.id },
          data: { quantidadeAtual: novaQuantidade },
        });

        // Registra movimentação por lote
        await tx.movimentacaoLote.create({
          data: {
            loteId: lote.id,
            tipo: TipoMovimentacao.ENTRADA,
            quantidade: devolver,
            observacao: `Cancelamento da venda ${venda.numero}`,
          },
        });

        devolver = 0; // devolve tudo no lote mais recente
      }

      // Cria movimentação geral
      await tx.movimentacao.create({
        data: {
          produtoId,
          tipo: TipoMovimentacao.ENTRADA,
          quantidade,
          observacao: `Cancelamento da venda ${venda.numero}`,
        },
      });
    }

    // 🔹 Atualiza status da venda
    await tx.venda.update({
      where: { id: venda.id },
      data: {
        status: "Cancelada",
        observacoes: `${
          venda.observacoes || ""
        } | Venda cancelada em ${new Date().toLocaleString("pt-BR")}`,
      },
    });
  });

  return {
    message: "Venda cancelada com sucesso e estoque devolvido aos lotes.",
  };
};

///////////////////////
//Consulta com filtros
///////////////////////

export const getVendasFiltrarService = async (filtros: any) => {
  const whereClause: any = {};

  // 🧍 Cliente
  if (filtros.clienteId && filtros.clienteId !== "todos") {
    whereClause.clienteId = filtros.clienteId;
  }

  // 👨‍💼 Vendedor
  if (filtros.vendedorId && filtros.vendedorId !== "todos") {
    whereClause.vendedorId = filtros.vendedorId;
  }

  // 📦 Status
  if (filtros.status && filtros.status !== "todos") {
    whereClause.status = filtros.status;
  }

  // 💳 Forma de pagamento
  if (filtros.formaPagamento && filtros.formaPagamento !== "todos") {
    const formas = filtros.formaPagamento
      .split(",")
      .map((f: string) => f.trim());

    if (formas.length > 1) {
      whereClause.formaPagamento = {
        in: formas,
        mode: "insensitive",
      };
    } else {
      whereClause.formaPagamento = {
        equals: formas[0],
        mode: "insensitive",
      };
    }
  }

  // 🗓️ Filtros de data opcionais
  if (filtros.dataInicio || filtros.dataFim) {
    whereClause.criadoEm = {}; // cuidado: use "criadoEm" se esse é o campo real

    if (filtros.dataInicio) {
      whereClause.criadoEm.gte = new Date(filtros.dataInicio as string);
    }

    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim as string);
      dataFim.setHours(23, 59, 59, 999);
      whereClause.criadoEm.lte = dataFim;
    }
  }

  // 🔎 Consulta ao banco
  const vendasFiltradas = await prisma.venda.findMany({
    where: whereClause,
    include: {
      itens: {
        select: {
          produto: { select: { nome: true, id: true } },
          quantidade: true,
          precoUnitario: true,
          vendaId: true,
        },
      },
      cliente: { select: { nome: true, id: true } },
      vendedor: { select: { nome: true, id: true } },
    },
    orderBy: { criadoEm: "desc" },
  });

  return vendasFiltradas;
};
