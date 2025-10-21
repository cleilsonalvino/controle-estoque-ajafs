import { PrismaClient, TipoMovimentacao } from "@prisma/client";
import { type CreateMovimentacaoDto } from "./stock.dto.ts";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export class StockService {
  public async createMovimentacao(data: CreateMovimentacaoDto) {
    const {
      produtoId,
      tipo,
      quantidade,
      observacao,
      fornecedorId,
      precoCusto,
      validade,
    } = data;

    return prisma.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({
        where: { id: produtoId },
      });

      if (!produto) {
        throw new CustomError("Produto não encontrado", 404);
      }

      // ============================================
      // 🔹 ENTRADA (cria novo Lote)
      // ============================================
      if (tipo === TipoMovimentacao.ENTRADA) {
        // Cria um novo lote
        const novoLote = await tx.lote.create({
          data: {
            produtoId,
            fornecedorId: fornecedorId || null,
            precoCusto: precoCusto ?? 0,
            quantidadeAtual: quantidade,
            validade: validade ? new Date(validade) : null,
          },
        });

        // Cria a movimentação específica do lote
        await tx.movimentacaoLote.create({
          data: {
            loteId: novoLote.id,
            tipo: TipoMovimentacao.ENTRADA,
            quantidade,
            observacao: observacao ?? "Entrada via criação de lote",
          },
        });

        // Cria também a movimentação geral
        const movimentacaoGeral = await tx.movimentacao.create({
          data: {
            produtoId,
            tipo,
            quantidade,
            observacao: observacao ?? "Entrada de produto com lote",
          },
        });

        return movimentacaoGeral;
      }

      // ============================================
      // 🔹 SAÍDA ou AJUSTE
      // ============================================
      if (tipo === TipoMovimentacao.SAIDA || tipo === TipoMovimentacao.AJUSTE) {
        // Calcula estoque total somando todos os lotes
        const lotes = await tx.lote.findMany({
          where: { produtoId },
          orderBy: { dataCompra: "asc" }, // FIFO: usa o lote mais antigo primeiro
        });

        const estoqueTotal = lotes.reduce(
          (acc, lote) => acc + Number(lote.quantidadeAtual),
          0
        );

        if (estoqueTotal < quantidade) {
          throw new CustomError(
            "Estoque insuficiente para realizar a saída",
            400
          );
        }

        // Reduz a quantidade nos lotes (FIFO)
        let restante = Number(quantidade);
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
              tipo,
              quantidade: retirar,
              observacao:
                observacao ??
                (tipo === TipoMovimentacao.SAIDA
                  ? "Saída de produto (FIFO)"
                  : "Ajuste de estoque"),
            },
          });

          restante -= retirar;
        }

        // Cria movimentação geral
        const movimentacaoGeral = await tx.movimentacao.create({
          data: {
            produtoId,
            tipo,
            quantidade,
            observacao:
              observacao ??
              (tipo === TipoMovimentacao.SAIDA
                ? "Saída manual de produto"
                : "Ajuste manual de estoque"),
          },
        });

        return movimentacaoGeral;
      }

      throw new CustomError("Tipo de movimentação inválido", 400);
    });
  }

  // ============================================
  // 🔹 Lista movimentações por produto
  // ============================================
  public async getMovimentacoesByProdutoId(produtoId: string) {
    return prisma.movimentacao.findMany({
      where: { produtoId },
      orderBy: { criadoEm: "desc" },
    });
  }

  // ============================================
  // 🔹 Lista todas as movimentações
  // ============================================
  public async getMovimentacoes() {
    return prisma.movimentacao.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }
public async getValorEstoque() {
  const lotes = await prisma.lote.findMany({
    where: {
      quantidadeAtual: { gt: 0 },
    },
    include: { produto: true },
  });

  const valorEstoque = lotes.reduce((total, lote) => {
    const preco = Number(lote.precoCusto) || 0;
    const quantidade = Number(lote.quantidadeAtual) || 0;
    return total + preco * quantidade;
  }, 0);

  return {
    total: valorEstoque,
    quantidadeLotes: lotes.length,
    produtosDistintos: new Set(lotes.map((l) => l.produtoId)).size,
  };
}

}
