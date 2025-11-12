import { PrismaClient, TipoMovimentacao } from "@prisma/client";
import { CustomError } from "../../shared/errors";

const prisma = new PrismaClient();

/**
 * ======================================================
 * CREATE VENDA (FIFO + única tabela de movimentações)
 * ======================================================
 */
export const createVendaService = async (data: any, empresaId: string) => {
  if (!data.itens || data.itens.length === 0)
    throw new CustomError("A venda precisa ter pelo menos um item", 400);

  // Verifica estoque de cada item
  for (const item of data.itens) {
    const produto = await prisma.produto.findFirst({
      where: { id: item.produtoId, empresaId },
      select: { nome: true },
    });
    if (!produto) throw new CustomError("Produto não encontrado", 404);

    const lotes = await prisma.lote.findMany({
      where: { produtoId: item.produtoId, empresaId, quantidadeAtual: { gt: 0 } },
    });

    const estoqueTotal = lotes.reduce((acc, l) => acc + Number(l.quantidadeAtual), 0);
    if (estoqueTotal < Number(item.quantidade))
      throw new CustomError(
        `Estoque insuficiente para "${produto.nome}". Disponível: ${estoqueTotal}.`,
        400
      );
  }

  // Transação
  return prisma.$transaction(async (tx) => {
    const total = data.itens.reduce(
      (sum: number, item: any) =>
        sum + Number(item.precoUnitario) * Number(item.quantidade),
      0
    );

    const venda = await tx.venda.create({
      data: {
        numero: `VND-${Date.now()}`,
        clienteId: data.clienteId || null,
        vendedorId: data.vendedorId || null,
        total,
        formaPagamento: data.formaPagamento || "Dinheiro",
        desconto: data.desconto || 0,
        status: "Concluída",
        empresaId,
      },
    });

    // Cria itens
    await tx.itemVenda.createMany({
      data: data.itens.map((i: any) => ({
        vendaId: venda.id,
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        empresaId,
      })),
    });

    // Atualiza estoque e cria movimentações (FIFO)
    for (const item of data.itens) {
      let restante = Number(item.quantidade);
      const lotes = await tx.lote.findMany({
        where: { produtoId: item.produtoId, empresaId, quantidadeAtual: { gt: 0 } },
        orderBy: { dataCompra: "asc" },
      });

      for (const lote of lotes) {
        if (restante <= 0) break;
        const retirar = Math.min(Number(lote.quantidadeAtual), restante);

        await tx.lote.update({
          where: { id: lote.id },
          data: { quantidadeAtual: Number(lote.quantidadeAtual) - retirar },
        });

        await tx.movimentacao.create({
          data: {
            produtoId: item.produtoId,
            loteId: lote.id,
            tipo: TipoMovimentacao.SAIDA,
            quantidade: retirar,
            observacao: `Venda ${venda.numero}`,
            empresaId,
          },
        });

        restante -= retirar;
      }
    }

    // Cria o registro de Pós-venda
    await tx.posVenda.create({
      data: {
        vendaId: venda.id,
        clienteId: venda.clienteId,
        empresaId: venda.empresaId,
        status: "PENDENTE",
      },
    });

    return venda;
  });
};

export const createSaleServicesService = async (data: any, empresaId: string) => {
  if (!data.vendedorId) throw new CustomError("O vendedor é obrigatório.", 400);
  if (!data.itens || data.itens.length === 0)
    throw new CustomError("A venda de serviço precisa conter ao menos um item.", 400);

  // Verifica se os serviços existem e pertencem à empresa
  for (const item of data.itens) {
    const servico = await prisma.servico.findFirst({
      where: { id: item.servicoId, empresaId },
      select: { nome: true },
    });
    if (!servico) {
      throw new CustomError(`Serviço não encontrado para o item informado.`, 404);
    }
  }

  // Calcula o total
  const total = data.itens.reduce(
    (sum: number, item: any) =>
      sum + Number(item.precoUnitario) * Number(item.quantidade || 1),
    0
  );

  // Cria a venda e os itens dentro de uma transação
  return prisma.$transaction(async (tx) => {
    const venda = await tx.venda.create({
      data: {
        numero: `SRV-${Date.now()}`,
        clienteId: data.clienteId || null,
        vendedorId: data.vendedorId,
        total,
        formaPagamento: data.formaPagamento || "Dinheiro",
        desconto: data.desconto || 0,
        status: "Concluída",
        empresaId,
      },
    });

    await tx.tipoServico.createMany({
      data: data.itens.map((item: any) => ({
        vendaId: venda.id,
        servicoId: item.servicoId,
        quantidade: item.quantidade || 1,
        precoUnitario: item.precoUnitario,
        empresaId,
      })),
    });

    // Cria o registro de Pós-venda
    await tx.posVenda.create({
        data: {
            vendaId: venda.id,
            clienteId: venda.clienteId,
            empresaId: venda.empresaId,
            status: "PENDENTE",
        },
    });

    return venda;
  });
};

export const getVendasTopProdutosService = async (empresaId: string) => {
  const topProducts = await prisma.itemVenda.groupBy({
    by: ['produtoId'],
    _sum: {
      quantidade: true,
    },
    where: {
      empresaId,
    },
    orderBy: {
      _sum: {
        quantidade: 'desc',
      },
    },
    take: 10,
  });

  const resultados = await Promise.all(topProducts.map(async (item) => {
    const produto = await prisma.produto.findUnique({
      where: { id: item.produtoId },
      include: { categoria: true },
    });

    return {
      produto,
      totalVendido: item._sum.quantidade || 0,
    };
  }));

  console.log(resultados);

  return resultados;
};
  

/**
 * ======================================================
 * UPDATE VENDA
 * ======================================================
 */
export const updateVendaService = async (id: string, data: any, empresaId: string) => {
  const venda = await prisma.venda.findFirst({
    where: { id, empresaId },
    include: { itens: true },
  });
  if (!venda) throw new CustomError("Venda não encontrada", 404);

  const novosItens = data.itens;
  if (!novosItens || novosItens.length === 0)
    throw new CustomError("A venda precisa ter ao menos um item", 400);

  return prisma.$transaction(async (tx) => {
    const antigosMap = new Map(venda.itens.map((i) => [i.produtoId, i]));

    for (const item of novosItens) {
      const antigo = antigosMap.get(item.produtoId);
      const diff = Number(item.quantidade) - (antigo ? Number(antigo.quantidade) : 0);

      // 🔹 Se a nova quantidade for maior → baixa estoque
      if (diff > 0) {
        let restante = diff;
        const lotes = await tx.lote.findMany({
          where: { produtoId: item.produtoId, empresaId, quantidadeAtual: { gt: 0 } },
          orderBy: { dataCompra: "asc" },
        });
        for (const lote of lotes) {
          if (restante <= 0) break;
          const retirar = Math.min(Number(lote.quantidadeAtual), restante);
          await tx.lote.update({
            where: { id: lote.id },
            data: { quantidadeAtual: Number(lote.quantidadeAtual) - retirar },
          });
          await tx.movimentacao.create({
            data: {
              produtoId: item.produtoId,
              loteId: lote.id,
              tipo: TipoMovimentacao.SAIDA,
              quantidade: retirar,
              observacao: `Ajuste +${diff} na venda ${venda.numero}`,
              empresaId,
            },
          });
          restante -= retirar;
        }
      }

      // 🔹 Se for menor → devolve ao estoque (LIFO)
      if (diff < 0) {
        let devolver = Math.abs(diff);
        const lotes = await tx.lote.findMany({
          where: { produtoId: item.produtoId, empresaId },
          orderBy: { dataCompra: "desc" },
        });
        for (const lote of lotes) {
          if (devolver <= 0) break;
          await tx.lote.update({
            where: { id: lote.id },
            data: { quantidadeAtual: Number(lote.quantidadeAtual) + devolver },
          });
          await tx.movimentacao.create({
            data: {
              produtoId: item.produtoId,
              loteId: lote.id,
              tipo: TipoMovimentacao.ENTRADA,
              quantidade: devolver,
              observacao: `Ajuste -${Math.abs(diff)} na venda ${venda.numero}`,
              empresaId,
            },
          });
          devolver = 0;
        }
      }

      antigosMap.delete(item.produtoId);
    }

    // 🔹 Remove itens antigos não mais presentes
    for (const [, itemRemovido] of antigosMap) {
      const lotes = await tx.lote.findMany({
        where: { produtoId: itemRemovido.produtoId, empresaId },
        orderBy: { dataCompra: "desc" },
      });
      const quantidade = Number(itemRemovido.quantidade);
      for (const lote of lotes) {
        await tx.lote.update({
          where: { id: lote.id },
          data: { quantidadeAtual: Number(lote.quantidadeAtual) + quantidade },
        });
        await tx.movimentacao.create({
          data: {
            produtoId: itemRemovido.produtoId,
            loteId: lote.id,
            tipo: TipoMovimentacao.ENTRADA,
            quantidade,
            observacao: `Remoção de item da venda ${venda.numero}`,
            empresaId,
          },
        });
        break;
      }
    }

    await tx.itemVenda.deleteMany({ where: { vendaId: id } });
    await tx.itemVenda.createMany({
      data: novosItens.map((i: any) => ({
        vendaId: id,
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        empresaId,
      })),
    });

    const total = novosItens.reduce(
      (sum: number, i: any) => sum + Number(i.precoUnitario) * Number(i.quantidade),
      0
    );

    return tx.venda.update({
      where: { id },
      data: { total, clienteId: data.clienteId || venda.clienteId },
    });
  });
};

/**
 * ======================================================
 * CANCELA VENDA
 * ======================================================
 */
export const cancelVendaService = async (id: string, empresaId: string) => {
  const venda = await prisma.venda.findFirst({
    where: { id, empresaId },
    include: { itens: true },
  });
  if (!venda) throw new CustomError("Venda não encontrada", 404);
  if (venda.status === "Cancelada")
    throw new CustomError("Essa venda já foi cancelada.", 400);

  return prisma.$transaction(async (tx) => {
    for (const item of venda.itens) {
      const lotes = await tx.lote.findMany({
        where: { produtoId: item.produtoId, empresaId },
        orderBy: { dataCompra: "desc" },
      });
      const qtd = Number(item.quantidade);
      for (const lote of lotes) {
        await tx.lote.update({
          where: { id: lote.id },
          data: { quantidadeAtual: Number(lote.quantidadeAtual) + qtd },
        });
        await tx.movimentacao.create({
          data: {
            produtoId: item.produtoId,
            loteId: lote.id,
            tipo: TipoMovimentacao.ENTRADA,
            quantidade: qtd,
            observacao: `Cancelamento da venda ${venda.numero}`,
            empresaId,
          },
        });
        break;
      }
    }

    await tx.venda.update({
      where: { id },
      data: {
        status: "Cancelada",
        observacoes: `${venda.observacoes || ""} | Cancelada em ${new Date().toLocaleString("pt-BR")}`,
      },
    });
  });
};

/**
 * ======================================================
 * CONSULTAS E UTILITÁRIOS
 * ======================================================
 */
export const getVendasService = async (empresaId: string) => {
  return prisma.venda.findMany({
    where: { empresaId },
    include: {
      itens: {
        include: { produto: true },
      },
      cliente: true,
      vendedor: true,
    },
    orderBy: { criadoEm: "desc" },
  });
};

export const getVendaByIdService = async (id: string, empresaId: string) => {
  const venda = await prisma.venda.findFirst({
    where: { id, empresaId },
    include: { itens: { include: { produto: true } } },
  });
  if (!venda) throw new CustomError("Venda não encontrada", 404);
  return venda;
};

export const deleteVendaService = async (id: string, empresaId: string) => {
  const venda = await prisma.venda.findFirst({ where: { id, empresaId } });
  if (!venda) throw new CustomError("Venda não encontrada", 404);
  await prisma.venda.delete({ where: { id } });
  return { message: "Venda excluída com sucesso." };
};

export const getVendasFiltrarService = async (filtros: any, empresaId: string) => {
  const where: any = { empresaId };

  if (filtros.clienteId && filtros.clienteId !== "todos")
    where.clienteId = filtros.clienteId;
  if (filtros.vendedorId && filtros.vendedorId !== "todos")
    where.vendedorId = filtros.vendedorId;
  if (filtros.status && filtros.status !== "todos")
    where.status = filtros.status;
  if (filtros.dataInicio || filtros.dataFim) {
    where.criadoEm = {};
    if (filtros.dataInicio)
      where.criadoEm.gte = new Date(filtros.dataInicio);
    if (filtros.dataFim) {
      const fim = new Date(filtros.dataFim);
      fim.setHours(23, 59, 59, 999);
      where.criadoEm.lte = fim;
    }
  }
  if(filtros.tipoVenda && filtros.tipoVenda !== "todos"){
    where.tipoVenda = filtros.tipoVenda;
  }

  return prisma.venda.findMany({
    where,
    include: {
      itens: { include: { produto: true } },
      cliente: true,
      vendedor: true,
    },
    orderBy: { criadoEm: "desc" },
  });
};
