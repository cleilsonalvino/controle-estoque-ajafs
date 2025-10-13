import { Router } from 'express';
import { StockController } from './stock.controller.ts';
import { validate } from '../../app/middlewares/validate.ts';
import { createMovimentacaoSchema } from './stock.dto.ts';

const router = Router();
const stockController = new StockController();

// =======================
// Movimentações de estoque
// =======================
router.post(
  '/movimentacao',
  validate(createMovimentacaoSchema),
  stockController.createMovimentacao
);

router.get(
  '/movimentacao/:produtoId',
  stockController.getMovimentacoesByProdutoId
);

// =======================
// Dashboards e análises
// =======================

// Total geral de estoque (quantidade e valor total)
router.get('/estoque/total', stockController.getTotalEstoque);

// Giro de estoque (geral ou por produto)
  router.get('/estoque/giro/:produtoId', stockController.getGiroDeEstoque);

// Produtos com estoque baixo
router.get('/estoque/baixo', stockController.getProdutosComBaixoEstoque);

// Histórico mensal de movimentações (entradas/saídas)
router.get('/estoque/historico', stockController.getResumoMovimentacoes);

// Valor total de estoque em reais
router.get('/estoque/valor-total', stockController.getValorTotalEstoque);

// Resumo geral para dashboard
router.get('/estoque/dashboard', stockController.getDashboardResumo);

export default router;
