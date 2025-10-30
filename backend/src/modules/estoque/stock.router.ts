import { Router } from 'express';
import { StockController } from './stock.controller.ts';


const router = Router();
const stockController = new StockController();

router.post(
  '/movimentacao',
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

router.get('/valor-estoque', stockController.getValorEstoque);

router.get('/custo-medio-estimado', stockController.getLucroMedioEstimado);


router.get('/estoque-produto/:produtoId', stockController.getEstoqueProdutoId);


router.delete('/deletar-lote/:loteId/produto/:produtoId', stockController.deleteLote);


export default router;