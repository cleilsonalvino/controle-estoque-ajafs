import { PrismaClient, TipoMovimentacao } from "@prisma/client";
import { type CreateMovimentacaoDto } from "./stock.dto.ts";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export class StockService {
  // ============================================================
  // 🔹 CRIA MOVIMENTAÇÃO (ENTRADA / SAÍDA / AJUSTE)
  // ============================================================
  public async createMovimentacao(data: CreateMovimentacaoDto, empresaId: string) {
    const { produtoId, tipo, quantidade, observacao, fornecedorId, precoCusto, validade } = data;

    if (!quantidade || isNaN(Number(quantidade))) {
      throw new CustomError("Quantidade inválida", 400);
    }

    return prisma.$transaction(async (tx) => {
      const produto = await tx.produto.findFirst({
        where: { id: produtoId, empresaId },
      });
      if (!produto) throw new CustomError("Produto não encontrado", 404);

      // helper FIFO
      const consumirFIFO = async (qtdParaConsumir: number, tipoMov: TipoMovimentacao, obsPadrao: string) => {
        const lotes = await tx.lote.findMany({
          where: { produtoId, empresaId },
          orderBy: { criadoEm: "asc" },
        });

        const estoqueTotal = lotes.reduce((acc, l) => acc + Number(l.quantidadeAtual), 0);
        if (estoqueTotal < qtdParaConsumir) {
          throw new CustomError("Estoque insuficiente para realizar a saída", 400);
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

          await tx.movimentacao.create({
            data: {
              produtoId,
              tipo: tipoMov,
              quantidade: retirar,
              observacao: observacao ?? obsPadrao,
              empresaId,
              loteId: lote.id,
            },
          });

          restante -= retirar;
        }
      };

      const precoCustoAtualizado = data.precoCusto ? data.precoCusto.replace(",", ".") : null;

      // ==============================
      // 🔸 ENTRADA
      // ==============================
      if (tipo === TipoMovimentacao.ENTRADA) {
        const novoLote = await tx.lote.create({
          data: {
            produtoId,
            fornecedorId: fornecedorId || null,
            precoCusto: precoCustoAtualizado ?? 0,
            quantidadeAtual: quantidade,
            validade: validade ? new Date(validade) : null,
            empresaId,
          },
        });

        const movimentacaoGeral = await tx.movimentacao.create({
          data: {
            produtoId,
            tipo,
            quantidade,
            observacao: observacao ?? "Entrada de produto com lote",
            loteId: novoLote.id,
            empresaId,
          },
        });

        return movimentacaoGeral;
      }

      // ==============================
      // 🔸 SAÍDA
      // ==============================
      if (tipo === TipoMovimentacao.SAIDA) {
        await consumirFIFO(Number(quantidade), TipoMovimentacao.SAIDA, "Saída de produto (FIFO)");
        const movimentacaoGeral = await tx.movimentacao.create({
          data: {
            produtoId,
            tipo,
            quantidade,
            observacao: observacao ?? "Saída manual de produto",
            empresaId,
          },
        });
        return movimentacaoGeral;
      }

      // ==============================
      // 🔸 AJUSTE
      // ==============================
      if (tipo === TipoMovimentacao.AJUSTE) {
        const qtd = Number(quantidade);
        if (qtd === 0) throw new CustomError("Ajuste com quantidade zero não é permitido", 400);

        if (qtd > 0) {
          const loteAjuste = await tx.lote.create({
            data: {
              produtoId,
              fornecedorId: fornecedorId || null,
              precoCusto: precoCusto ?? 0,
              quantidadeAtual: qtd,
              validade: validade ? new Date(validade) : null,
              empresaId,
            },
          });

          const mov = await tx.movimentacao.create({
            data: {
              produtoId,
              tipo: TipoMovimentacao.AJUSTE,
              quantidade: qtd,
              observacao: observacao ?? "Ajuste positivo de estoque",
              loteId: loteAjuste.id,
              empresaId,
            },
          });

          return mov;
        } else {
          const qtdAbs = Math.abs(qtd);
          await consumirFIFO(qtdAbs, TipoMovimentacao.AJUSTE, "Ajuste negativo de estoque (FIFO)");

          const mov = await tx.movimentacao.create({
            data: {
              produtoId,
              tipo: TipoMovimentacao.AJUSTE,
              quantidade: qtdAbs,
              observacao: observacao ?? "Ajuste negativo de estoque",
              empresaId,
              loteId: null, // Ajuste negativo não está associado a um lote específico
            },
          });

          return mov;
        }
      }

      throw new CustomError("Tipo de movimentação inválido", 400);
    });
  }

  // ============================================================
  // 🔹 LISTA MOVIMENTAÇÕES POR PRODUTO
  // ============================================================
  public async getMovimentacoesByProdutoId(produtoId: string, empresaId: string) {
    return prisma.movimentacao.findMany({
      where: { produtoId, empresaId },
      orderBy: { criadoEm: "desc" },
    });
  }

  // ============================================================
  // 🔹 LISTA TODAS MOVIMENTAÇÕES
  // ============================================================
  public async getMovimentacoes(empresaId: string) {
    return prisma.movimentacao.findMany({
      where: { empresaId },
      orderBy: { criadoEm: "desc" },
      include: {
        produto: { select: { id: true, nome: true } },
      },
    });
  }

  // ============================================================
  // 🔹 VALOR TOTAL DO ESTOQUE
  // ============================================================
  public async getValorEstoque(empresaId: string) {
    const lotes = await prisma.lote.findMany({
      where: { empresaId, quantidadeAtual: { gt: 0 } },
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

  // ============================================================
  // 🔹 ESTOQUE DE UM PRODUTO ESPECÍFICO
  // ============================================================
  public async getEstoqueProdutoId(produtoId: string, empresaId: string) {
    const lotes = await prisma.lote.findMany({
      where: { produtoId, empresaId, quantidadeAtual: { gt: 0 } },
    });

    const estoqueTotal = lotes.reduce((total, lote) => total + Number(lote.quantidadeAtual), 0);
    return { estoqueTotal };
  }

  // ============================================================
  // 🔹 DELETAR LOTE (e criar movimentação de ajuste)
  // ============================================================
  public async deleteLote(loteId: string, produtoId: string, empresaId: string) {
    const lote = await prisma.lote.findFirst({ where: { id: loteId, empresaId } });
    if (!lote) throw new CustomError("Lote não encontrado.", 404);
    if (lote.produtoId !== produtoId)
      throw new CustomError("Lote não pertence ao produto especificado.", 400);

    const produto = await prisma.produto.findFirst({ where: { id: produtoId, empresaId } });

    await prisma.lote.delete({ where: { id: loteId } });

    await prisma.movimentacao.create({
      data: {
        observacao: `Lote ${loteId} deletado do produto ${produto?.nome || produtoId}`,
        produtoId,
        quantidade: lote.quantidadeAtual,
        tipo: TipoMovimentacao.AJUSTE,
        empresaId,
        loteId,
      },
    });
  }

  // ============================================================
  // 🔹 LUCRO MÉDIO ESTIMADO
  // ============================================================
  public async getLucroMedioEstimado(empresaId: string) {
    const produtos = await prisma.produto.findMany({
      where: {
        empresaId,
        lote: { some: { quantidadeAtual: { gt: 0 } } },
      },
      include: {
        lote: { where: { quantidadeAtual: { gt: 0 } } },
      },
    });

    let lucroTotal = 0;
    let quantidadeTotal = 0;

    for (const produto of produtos) {
      const lotes = produto.lote;
      const quantidadeProduto = lotes.reduce((acc, l) => acc + Number(l.quantidadeAtual), 0);
      if (quantidadeProduto === 0) continue;

      const custoTotal = lotes.reduce(
        (acc, l) => acc + Number(l.precoCusto) * Number(l.quantidadeAtual),
        0
      );
      const custoMedio = custoTotal / quantidadeProduto;

      const precoVenda = Number(produto.precoVenda) || 0;
      const lucroUnitario = precoVenda - custoMedio;

      lucroTotal += lucroUnitario * quantidadeProduto;
      quantidadeTotal += quantidadeProduto;
    }

    const lucroMedioEstimado = quantidadeTotal > 0 ? lucroTotal / quantidadeTotal : 0;
    const lucroFormatado = lucroMedioEstimado.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return { lucroMedioEstimado, lucroFormatado };
  }
}
