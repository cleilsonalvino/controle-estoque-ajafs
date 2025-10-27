import { Router } from 'express';
import { StockController } from './stock.controller.ts';
import { validateBody } from '../../shared/zod.ts';
import { createMovimentacaoSchema } from './stock.dto.ts';

const router = Router();
const stockController = new StockController();

router.post(
  '/movimentacao',
  validateBody(createMovimentacaoSchema),
  stockController.createMovimentacao
);

router.get(
  '/movimentacoes/:produtoId',
  stockController.getMovimentacoesByProdutoId
);

router.get(
  '/movimentacoes',
  stockController.getMovimentacoes
);

router.get('/estoque-produto/:produtoId', stockController.getEstoqueProdutoId);


router.get('/valor-estoque', stockController.getValorEstoque);

router.get('/custo-medio-estimado', stockController.getLucroMedioEstimado);

router.delete('/deletar-lote/:loteId/produto/:produtoId', stockController.deleteLote);

export default router;