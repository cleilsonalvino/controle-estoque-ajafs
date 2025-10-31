import { type Request, type Response } from "express";
import { empresaService } from "./empresa.service.ts";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware.ts";

export const empresaController = {
  // GET /empresas - Acessível apenas por super-admin (lógica de RBAC a ser implementada)
  async getAll(req: AuthenticatedRequest, res: Response) {
    const empresas = await empresaService.getAll();
    res.json(empresas);
  },

  // POST /empresas - Rota pública ou de super-admin para criar novas empresas
  async create(req: AuthenticatedRequest, res: Response) {
    const empresa = await empresaService.create(req.body);
    res.status(201).json(empresa);
  },

  // GET /empresas/:id - Usuário só pode ver sua própria empresa
  async getById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { empresaId } = req.user!;
    const empresa = await empresaService.getById(id as string, empresaId);
    res.json(empresa);
  },

  // PUT /empresas/:id - Usuário só pode atualizar sua própria empresa
  async update(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { empresaId } = req.user!;
    const empresa = await empresaService.update(
      id as string,
      req.body,
      empresaId
    );
    res.json(empresa);
  },

  // DELETE /empresas/:id - Acessível apenas por super-admin
  async remove(req: AuthenticatedRequest, res: Response) {
    await empresaService.remove(req.params.id as string);
    res.status(204).send();
  },
};
