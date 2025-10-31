import { type Request, type Response } from "express";
import {
  createCategoriaServicoService,
  getCategoriasServicosService,
  getCategoriaServicoByIdService,
  updateCategoriaServicoService,
  deleteCategoriaServicoService,
} from "./categoria-servico.service.ts";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware.ts";

export const createCategoriaServicoController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { empresaId } = req.user!;
  const categoria = await createCategoriaServicoService(req.body, empresaId);
  res.status(201).json(categoria);
};

export const getCategoriasServicosController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { empresaId } = req.user!;
  const categorias = await getCategoriasServicosService(empresaId);
  res.status(200).json(categorias);
};

export const getCategoriaServicoByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const categoria = await getCategoriaServicoByIdService(id as string, empresaId);
  res.status(200).json(categoria);
};

export const updateCategoriaServicoController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const categoria = await updateCategoriaServicoService(
    id as string,
    req.body,
    empresaId
  );
  res.status(200).json(categoria);
};

export const deleteCategoriaServicoController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  await deleteCategoriaServicoService(id as string, empresaId);
  res.status(204).send();
};
