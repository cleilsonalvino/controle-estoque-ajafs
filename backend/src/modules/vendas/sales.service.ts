  import { PrismaClient } from "@prisma/client";
  import { AppError } from "../../shared/errors.ts";

  const prisma = new PrismaClient();

  // Venda Services

  export const createVendaService = async (data: any) => {
    const { itens, cliente } = data;

    if (!itens || itens.length === 0) {
      throw new AppError("A venda precisa ter pelo menos um item", 400);
    }

    const venda = await prisma.$transaction(async (prisma) => {
      // 1️⃣ Calcula o total automaticamente
      let total = 0;
      for (const item of itens) {
        total += Number(item.precoUnitario) * Number(item.quantidade);
      }

      // 2️⃣ Cria a venda
      const novaVenda = await prisma.venda.create({
        data: {
          numero: `VND-${Date.now()}`, // gera número automático único
          cliente,
          total,
          status: "Concluída",
        },
      });

      // 3️⃣ Cria os itens da venda
      const itensVenda = itens.map((item: any) => ({
        vendaId: novaVenda.id,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
      }));
      await prisma.itemVenda.createMany({ data: itensVenda });

      // 4️⃣ Atualiza estoque e cria movimentações
      for (const item of itens) {
        // Atualiza estoque
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: {
            estoqueAtual: { decrement: item.quantidade },
          },
        });

        // Cria movimentação
        await prisma.movimentacao.create({
          data: {
            produtoId: item.produtoId,
            tipo: "SAIDA",
            quantidade: item.quantidade,
            observacao: `Venda ${novaVenda.numero}`,
          },
        });
      }

      return novaVenda;
    });

    return venda;
  };


  export const getVendasService = async () => {
    const vendas = await prisma.venda.findMany({ include: { itens: true } });
    return vendas;
  };

  export const getVendaByIdService = async (id: string) => {
    const venda = await prisma.venda.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!venda) {
      throw new AppError("Venda não encontrada", 404);
    }
    return venda;
  };

  export const updateVendaService = async (id: string, data: any) => {
    const { itens, cliente } = data;

    if (!itens || itens.length === 0) {
      throw new AppError("A venda precisa ter pelo menos um item", 400);
    }

    const vendaAtual = await prisma.venda.findUnique({
      where: { id },
      include: { itens: true },
    });

    if (!vendaAtual) {
      throw new AppError("Venda não encontrada", 404);
    }

    const vendaAtualizada = await prisma.$transaction(async (prisma) => {
      // 1️⃣ Ajuste de estoque e movimentações
      // Mapear itens antigos para fácil acesso
      const itensAntigosMap = new Map(vendaAtual.itens.map(item => [item.produtoId, item]));

      for (const item of itens) {
        const antigo = itensAntigosMap.get(item.produtoId);

        const quantidadeAntiga = antigo ? Number(antigo.quantidade) : 0;
        const quantidadeNova = Number(item.quantidade);
        const diff = quantidadeNova - quantidadeAntiga;

        if (diff !== 0) {
          // Atualiza estoque (incrementa se diff < 0, decrementa se diff > 0)
          await prisma.produto.update({
            where: { id: item.produtoId },
            data: {
              estoqueAtual: diff > 0
                ? { decrement: diff }
                : { increment: -diff },
            },
          });

          // Cria movimentação
          await prisma.movimentacao.create({
            data: {
              produtoId: item.produtoId,
              tipo: "AJUSTE",
              quantidade: Math.abs(diff),
              observacao: `Ajuste na venda ${vendaAtual.numero}`,
            },
          });
        }

        // Remove do map para saber quais itens antigos foram deletados
        itensAntigosMap.delete(item.produtoId);
      }

      // 2️⃣ Itens antigos que não estão mais na venda → reverter estoque
      for (const [, itemRemovido] of itensAntigosMap) {
        await prisma.produto.update({
          where: { id: itemRemovido.produtoId },
          data: { estoqueAtual: { increment: Number(itemRemovido.quantidade) } },
        });

        await prisma.movimentacao.create({
          data: {
            produtoId: itemRemovido.produtoId,
            tipo: "AJUSTE",
            quantidade: Number(itemRemovido.quantidade),
            observacao: `Remoção de item da venda ${vendaAtual.numero}`,
          },
        });
      }

      // 3️⃣ Atualiza os itens da venda
      await prisma.itemVenda.deleteMany({ where: { vendaId: id } });

      const itensParaCriar = itens.map((item: any) => ({
        vendaId: id,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
      }));
      await prisma.itemVenda.createMany({ data: itensParaCriar });

      // 4️⃣ Recalcula total
      const total = itens.reduce((sum: any, item: any) => sum + Number(item.precoUnitario) * Number(item.quantidade), 0);

      // 5️⃣ Atualiza venda
      const vendaAtualizada = await prisma.venda.update({
        where: { id },
        data: { cliente, total },
      });

      return vendaAtualizada;
    });

    return vendaAtualizada;
  };


  export const deleteVendaService = async (id: string) => {
    const venda = await prisma.venda.findUnique({
      where: { id },
      include: { itens: true },
    });

    if (!venda) {
      throw new AppError("Venda não encontrada", 404);
    }

    await prisma.$transaction(async (prisma) => {
      // 1️⃣ Reverte o estoque e cria movimentações de ajuste
      for (const item of venda.itens) {
        // Atualiza estoque
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: {
            estoqueAtual: { increment: item.quantidade },
          },
        });

        // Cria movimentação de ajuste
        await prisma.movimentacao.create({
          data: {
            produtoId: item.produtoId,
            tipo: "AJUSTE",
            quantidade: item.quantidade,
            observacao: `Cancelamento da venda ${venda.numero}`,
          },
        });
      }

      // 2️⃣ Deleta os itens da venda
      await prisma.itemVenda.deleteMany({
        where: { vendaId: id },
      });

      // 3️⃣ Deleta a venda
      await prisma.venda.delete({
        where: { id },
      });
    });

    return { message: "Venda deletada e estoque ajustado com sucesso" };
  };
