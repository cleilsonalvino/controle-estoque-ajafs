import { type Request, type Response } from "express";
import {
  createCategoriaServicoService,
  getCategoriasServicosService,
  getCategoriaServicoByIdService,
  updateCategoriaServicoService,
  deleteCategoriaServicoService,
} from "./categoria-servico.service.ts";

export const createCategoriaServicoController = async (req: Request, res: Response) => {
  const categoria = await createCategoriaServicoService(req.body);
  res.status(201).json(categoria);
}

export const getCategoriasServicosController = async (_req: Request, res: Response) => {
  const categorias = await getCategoriasServicosService();
  res.status(200).json(categorias);
}

export const getCategoriaServicoByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const categoria = await getCategoriaServicoByIdService(id as string);
  res.status(200).json(categoria);
}

export const updateCategoriaServicoController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const categoria = await updateCategoriaServicoService(id as string, req.body);
  res.status(200).json(categoria);
}

export const deleteCategoriaServicoController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteCategoriaServicoService(id as string);
  res.status(204).send();
}

