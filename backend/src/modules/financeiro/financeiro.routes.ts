
import { Router } from "express";
import { authMiddleware } from "../../app/middlewares/auth.middleware";
import { validate } from "../../app/middlewares/validate";
import { financeiroController } from "./financeiro.controller";
import * as DTO from "./financeiro.dto";

const router = Router();

router.use(authMiddleware);

// Dashboard
router.get("/dashboard", financeiroController.getDashboard);

// Movimentações
router.get("/movimentacoes", financeiroController.listMovimentacoes);
router.post("/movimentacoes", validate(DTO.CreateMovimentacaoFinanceiraDTO), financeiroController.createMovimentacao);
router.put("/movimentacoes/:id", validate(DTO.UpdateMovimentacaoFinanceiraDTO), financeiroController.updateMovimentacao);
router.delete("/movimentacoes/:id", financeiroController.removeMovimentacao);

// Contas a pagar
router.get("/contas-pagar", financeiroController.listContasPagar);
router.post("/contas-pagar", validate(DTO.CreateContaPagarDTO), financeiroController.createContaPagar);
router.put("/contas-pagar/:id", validate(DTO.UpdateContaPagarDTO), financeiroController.updateContaPagar);
router.post("/contas-pagar/:id/pagar", validate(DTO.MarcarContaPagaDTO), financeiroController.marcarContaPaga);
router.delete("/contas-pagar/:id", financeiroController.deleteContaPagar);

// Contas a receber
router.get("/contas-receber", financeiroController.listContasReceber);
router.post("/contas-receber", validate(DTO.CreateContaReceberDTO), financeiroController.createContaReceber);
router.put("/contas-receber/:id", validate(DTO.UpdateContaReceberDTO), financeiroController.updateContaReceber);
router.post("/contas-receber/:id/receber", validate(DTO.MarcarContaRecebidaDTO), financeiroController.marcarContaRecebida);
router.delete("/contas-receber/:id", financeiroController.deleteContaReceber);

// Contas bancárias
router.get("/contas-bancarias", financeiroController.listContasBancarias);
router.post("/contas-bancarias", validate(DTO.CreateContaBancariaDTO), financeiroController.createContaBancaria);
router.put("/contas-bancarias/:id", validate(DTO.UpdateContaBancariaDTO), financeiroController.updateContaBancaria);
router.delete("/contas-bancarias/:id", financeiroController.deleteContaBancaria);
router.post("/contas-bancarias/transferir", validate(DTO.TransferenciaEntreContasDTO), financeiroController.transferirEntreContas);

// Categorias
router.get("/categorias", financeiroController.listCategorias);
router.post("/categorias", validate(DTO.CreateCategoriaFinanceiraDTO), financeiroController.createCategoria);
router.put("/categorias/:id", validate(DTO.UpdateCategoriaFinanceiraDTO), financeiroController.updateCategoria);
router.delete("/categorias/:id", financeiroController.archiveCategoria);

// Relatórios
router.get("/relatorios/fluxo-caixa", financeiroController.relatorioFluxoCaixa);
router.get("/relatorios/resumo-mensal", financeiroController.relatorioResumoMensal);

export default router;
