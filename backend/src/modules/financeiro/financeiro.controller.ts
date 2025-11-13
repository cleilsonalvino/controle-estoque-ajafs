
import { type Request, type Response } from "express";
import { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";
import { Papel } from "@prisma/client";
import { CustomError } from "../../shared/errors";

import {
    dashboardFinanceiroService,
    categoriaFinanceiraService,
    contaBancariaService,
    movimentacaoFinanceiraService,
    contaPagarService,
    contaReceberService,
    relatoriosFinanceiroService
} from "./financeiro.service";

const checkAdmin = (req: AuthenticatedRequest) => {
    if (req.user.papel !== Papel.ADMINISTRADOR && req.user.papel !== Papel.SUPER_ADMIN) {
        throw new CustomError("Acesso não autorizado. Permissão de administrador necessária.", 403);
    }
};

export const financeiroController = {
    // =================================
    // DASHBOARD
    // =================================
    async getDashboard(req: AuthenticatedRequest, res: Response) {
        const dashboardData = await dashboardFinanceiroService.getDashboard(req.user.empresaId);
        res.json({ data: dashboardData });
    },

    // =================================
    // CATEGORIAS
    // =================================
    async listCategorias(req: AuthenticatedRequest, res: Response) {
        const { tipo } = req.query;
        const categorias = await categoriaFinanceiraService.list(req.user.empresaId, tipo as any);
        res.json({ data: categorias });
    },
    async createCategoria(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const categoria = await categoriaFinanceiraService.create(req.user.empresaId, req.body);
        res.status(201).json({ data: categoria });
    },
    async updateCategoria(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        const categoria = await categoriaFinanceiraService.update(id, req.user.empresaId, req.body);
        res.json({ data: categoria });
    },
    async archiveCategoria(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        await categoriaFinanceiraService.archive(id, req.user.empresaId);
        res.status(204).send();
    },

    // =================================
    // CONTAS BANCÁRIAS
    // =================================
    async listContasBancarias(req: AuthenticatedRequest, res: Response) {
        const contas = await contaBancariaService.list(req.user.empresaId);
        res.json({ data: contas });
    },
    async createContaBancaria(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const conta = await contaBancariaService.create(req.user.empresaId, req.body);
        res.status(201).json({ data: conta });
    },
    async updateContaBancaria(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        const conta = await contaBancariaService.update(id, req.user.empresaId, req.body);
        res.json({ data: conta });
    },
    async deleteContaBancaria(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        await contaBancariaService.delete(id, req.user.empresaId);
        res.status(204).send();
    },
    async transferirEntreContas(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const result = await contaBancariaService.transferir(req.user.empresaId, req.body);
        res.json({ data: result });
    },

    // =================================
    // MOVIMENTAÇÕES
    // =================================
    async listMovimentacoes(req: AuthenticatedRequest, res: Response) {
        const movimentacoes = await movimentacaoFinanceiraService.list(req.user.empresaId, req.query);
        res.json({ data: movimentacoes });
    },
    async createMovimentacao(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const mov = await movimentacaoFinanceiraService.create(req.user.empresaId, req.body);
        res.status(201).json({ data: mov });
    },
    async updateMovimentacao(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        const mov = await movimentacaoFinanceiraService.update(id, req.user.empresaId, req.body);
        res.json({ data: mov });
    },
    async removeMovimentacao(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        await movimentacaoFinanceiraService.remove(id, req.user.empresaId);
        res.status(204).send();
    },

    // =================================
    // CONTAS A PAGAR
    // =================================
    async listContasPagar(req: AuthenticatedRequest, res: Response) {
        const contas = await contaPagarService.list(req.user.empresaId, req.query);
        res.json({ data: contas });
    },
    async createContaPagar(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const conta = await contaPagarService.create(req.user.empresaId, req.body);
        res.status(201).json({ data: conta });
    },
    async updateContaPagar(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        const conta = await contaPagarService.update(id, req.user.empresaId, req.body);
        res.json({ data: conta });
    },
    async deleteContaPagar(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        await contaPagarService.delete(id, req.user.empresaId);
        res.status(204).send();
    },
    async marcarContaPaga(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        const conta = await contaPagarService.marcarComoPago(id, req.user.empresaId, req.body);
        res.json({ data: conta });
    },

    // =================================
    // CONTAS A RECEBER
    // =================================
    async listContasReceber(req: AuthenticatedRequest, res: Response) {
        const contas = await contaReceberService.list(req.user.empresaId, req.query);
        res.json({ data: contas });
    },
    async createContaReceber(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const conta = await contaReceberService.create(req.user.empresaId, req.body);
        res.status(201).json({ data: conta });
    },
    async updateContaReceber(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        const conta = await contaReceberService.update(id, req.user.empresaId, req.body);
        res.json({ data: conta });
    },
    async deleteContaReceber(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        await contaReceberService.delete(id, req.user.empresaId);
        res.status(204).send();
    },
    async marcarContaRecebida(req: AuthenticatedRequest, res: Response) {
        checkAdmin(req);
        const { id } = req.params;
        const conta = await contaReceberService.marcarComoRecebido(id, req.user.empresaId, req.body);
        res.json({ data: conta });
    },

    // =================================
    // RELATÓRIOS
    // =================================
    async relatorioFluxoCaixa(req: AuthenticatedRequest, res: Response) {
        const { inicio, fim } = req.query;
        if (!inicio || !fim) throw new CustomError("Datas de início e fim são obrigatórias.", 400);
        const relatorio = await relatoriosFinanceiroService.fluxoCaixa(req.user.empresaId, new Date(inicio as string), new Date(fim as string));
        res.json({ data: relatorio });
    },
    async relatorioResumoMensal(req: AuthenticatedRequest, res: Response) {
        const { mes } = req.query;
        if (!mes) throw new CustomError("O mês é obrigatório.", 400);
        const relatorio = await relatoriosFinanceiroService.resumoMensal(req.user.empresaId, new Date(mes as string));
        res.json({ data: relatorio });
    },
};
