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

    if (!quantidade || isNaN(Number(quantidade))) {
      throw new CustomError("Quantidade inválida", 400);
    }

    return prisma.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({ where: { id: produtoId } });
      if (!produto) throw new CustomError("Produto não encontrado", 404);

      // helper para consumir FIFO
      const consumirFIFO = async (
        qtdParaConsumir: number,
        tipoMov: TipoMovimentacao,
        obsPadrao: string
      ) => {
        const lotes = await tx.lote.findMany({
          where: { produtoId },
          // garanta que a coluna usada aqui existe e é populada; se "dataCompra" puder ser nula,
          // prefira "createdAt" ou "id" asc para manter estabilidade do FIFO:
          orderBy: { criadoEm: "asc" },
        });

        const estoqueTotal = lotes.reduce(
          (acc, l) => acc + Number(l.quantidadeAtual),
          0
        );

        if (estoqueTotal < qtdParaConsumir) {
          throw new CustomError(
            "Estoque insuficiente para realizar a saída",
            400
          );
        }

        let restante = Number(qtdParaConsumir);
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
              tipo: tipoMov,
              quantidade: retirar,
              observacao: observacao ?? obsPadrao,
            },
          });

          restante -= retirar;
        }
      };

      // =============================
      // ENTRADA (cria novo lote)
      // =============================
      if (tipo === TipoMovimentacao.ENTRADA) {
        const novoLote = await tx.lote.create({
          data: {
            produtoId,
            fornecedorId: fornecedorId || null,
            precoCusto: precoCusto ?? 0,
            quantidadeAtual: quantidade,
            validade: validade ? new Date(validade) : null,
            // se tiver "dataCompra" no schema e não tiver default, descomente:
            // dataCompra: new Date(),
          },
        });

        await tx.movimentacaoLote.create({
          data: {
            loteId: novoLote.id,
            tipo: TipoMovimentacao.ENTRADA,
            quantidade,
            observacao: observacao ?? "Entrada via criação de lote",
          },
        });

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

      // =============================
      // SAÍDA
      // =============================
      if (tipo === TipoMovimentacao.SAIDA) {
        await consumirFIFO(
          Number(quantidade),
          TipoMovimentacao.SAIDA,
          "Saída de produto (FIFO)"
        );

        const movimentacaoGeral = await tx.movimentacao.create({
          data: {
            produtoId,
            tipo,
            quantidade,
            observacao: observacao ?? "Saída manual de produto",
          },
        });

        return movimentacaoGeral;
      }

      // =============================
      // AJUSTE (+ aumenta, - diminui)
      // =============================
      if (tipo === TipoMovimentacao.AJUSTE) {
        const qtd = Number(quantidade);

        if (qtd === 0) {
          throw new CustomError(
            "Ajuste com quantidade zero não é permitido",
            400
          );
        }

        if (qtd > 0) {
          // AUMENTAR ESTOQUE: por padrão, cria um lote técnico de ajuste
          const loteAjuste = await tx.lote.create({
            data: {
              produtoId,
              fornecedorId: fornecedorId || null, // pode ser null no ajuste
              precoCusto: precoCusto ?? 0,
              quantidadeAtual: qtd,
              validade: validade ? new Date(validade) : null,
              // dataCompra: new Date(),
            },
          });

          await tx.movimentacaoLote.create({
            data: {
              loteId: loteAjuste.id,
              tipo: TipoMovimentacao.AJUSTE,
              quantidade: qtd,
              observacao: observacao ?? "Ajuste positivo de estoque",
            },
          });

          const mov = await tx.movimentacao.create({
            data: {
              produtoId,
              tipo: TipoMovimentacao.AJUSTE,
              quantidade: qtd,
              observacao: observacao ?? "Ajuste positivo de estoque",
            },
          });

          return mov;
        } else {
          // DIMINUIR ESTOQUE: consome FIFO como se fosse saída
          const qtdAbs = Math.abs(qtd);

          await consumirFIFO(
            qtdAbs,
            TipoMovimentacao.AJUSTE,
            "Ajuste negativo de estoque (FIFO)"
          );

          const mov = await tx.movimentacao.create({
            data: {
              produtoId,
              tipo: TipoMovimentacao.AJUSTE,
              quantidade: qtdAbs, // armazene como positivo ou negativo conforme sua modelagem
              observacao: observacao ?? "Ajuste negativo de estoque",
            },
          });

          return mov;
        }
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

  public async getEstoqueProdutoId(produtoId: string) {
    const lotes = await prisma.lote.findMany({
      where: {
        produtoId,
        quantidadeAtual: { gt: 0 },
      },
    });

    const estoqueTotal = lotes.reduce((total, lote) => {
      return total + Number(lote.quantidadeAtual);
    }, 0);

    return { estoqueTotal };
  }
}
