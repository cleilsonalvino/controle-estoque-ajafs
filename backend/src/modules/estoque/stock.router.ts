import { Router } from 'express';
import { StockController } from './stock.controller.ts';
import { validate } from '../../shared/zod.ts';
import { createMovimentacaoSchema } from './stock.dto.ts';

const router = Router();
const stockController = new StockController();

router.post(
  '/saida',
  validate(createMovimentacaoSchema),
  stockController.createSaida
);

router.get(
  '/movimentacoes/:produtoId',
  stockController.getMovimentacoesByProdutoId
);

router.get(
  '/movimentacoes',
  stockController.getMovimentacoes
);

export default router;