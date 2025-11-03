import { Router } from "express";
import { StockController } from "./stock.controller";
import { authMiddleware } from "../../app/middlewares/auth.middleware";

const estoqueRouter = Router();
const controller = new StockController();

estoqueRouter.use(authMiddleware); // 🔐 todas as rotas exigem login



estoqueRouter.post("/movimentacao", controller.createMovimentacao.bind(controller));
estoqueRouter.get("/movimentacoes", controller.getMovimentacoes.bind(controller));
estoqueRouter.get("/movimentacoes/:produtoId", controller.getMovimentacoesByProdutoId.bind(controller));
estoqueRouter.get("/valor-estoque", controller.getValorEstoque.bind(controller));
estoqueRouter.get("/estoque/:produtoId", controller.getEstoqueProdutoId.bind(controller));
estoqueRouter.delete("/lote/:loteId/produto/:produtoId", controller.deleteLote.bind(controller));
estoqueRouter.get("/lucro", controller.getLucroMedioEstimado.bind(controller));

export default estoqueRouter;
