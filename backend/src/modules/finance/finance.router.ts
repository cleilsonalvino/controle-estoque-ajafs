import { Router } from "express";
import {
  createLancamentoFinanceiroController,
  getLancamentosFinanceirosController,
  getLancamentoFinanceiroByIdController,
} from "./finance.controller.ts";

const financeRouter = Router();

// LancamentoFinanceiro Routes
financeRouter.post("/lancamentos", createLancamentoFinanceiroController);
financeRouter.get("/lancamentos", getLancamentosFinanceirosController);
financeRouter.get("/lancamentos/:id", getLancamentoFinanceiroByIdController);

export default financeRouter;