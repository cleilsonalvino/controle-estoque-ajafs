import { Router } from "express";
import {
  createDepositoController,
  getDepositosController,
  getDepositoByIdController,
  updateDepositoController,
  deleteDepositoController,
  createLoteController,
  getLotesController,
  getLoteByIdController,
  updateLoteController,
  deleteLoteController,
  createPosicaoEstoqueController,
  getPosicoesEstoqueController,
  getPosicaoEstoqueByIdController,
  updatePosicaoEstoqueController,
  deletePosicaoEstoqueController,
  createMovimentacaoController,
  getMovimentacoesController,
  getMovimentacaoByIdController,
} from "./inventory.controller.ts";

const inventoryRouter = Router();

// Deposito Routes
inventoryRouter.post("/depositos", createDepositoController);
inventoryRouter.get("/depositos", getDepositosController);
inventoryRouter.get("/depositos/:id", getDepositoByIdController);
inventoryRouter.put("/depositos/:id", updateDepositoController);
inventoryRouter.delete("/depositos/:id", deleteDepositoController);

// Lote Routes
inventoryRouter.post("/lotes", createLoteController);
inventoryRouter.get("/lotes", getLotesController);
inventoryRouter.get("/lotes/:id", getLoteByIdController);
inventoryRouter.put("/lotes/:id", updateLoteController);
inventoryRouter.delete("/lotes/:id", deleteLoteController);

// PosicaoEstoque Routes
inventoryRouter.post("/posicoes-estoque", createPosicaoEstoqueController);
inventoryRouter.get("/posicoes-estoque", getPosicoesEstoqueController);
inventoryRouter.get("/posicoes-estoque/:id", getPosicaoEstoqueByIdController);
inventoryRouter.put("/posicoes-estoque/:id", updatePosicaoEstoqueController);
inventoryRouter.delete("/posicoes-estoque/:id", deletePosicaoEstoqueController);

// Movimentacao Routes
inventoryRouter.post("/movimentacoes", createMovimentacaoController);
inventoryRouter.get("/movimentacoes", getMovimentacoesController);
inventoryRouter.get("/movimentacoes/:id", getMovimentacaoByIdController);

export default inventoryRouter;