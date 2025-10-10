import { type Request, type Response } from "express";
import {
  createVendaService,
  getVendasService,
  getVendaByIdService,
  updateVendaService,
  deleteVendaService,
} from "./sales.service.ts";

// Venda Controllers

export const createVendaController = async (req: Request, res: Response) => {
  const venda = await createVendaService(req.body);
  res.status(201).json(venda);
};

export const getVendasController = async (req: Request, res: Response) => {
  const vendas = await getVendasService();
  res.status(200).json(vendas);
};

export const getVendaByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const venda = await getVendaByIdService(id as string);
  res.status(200).json(venda);
};

export const updateVendaController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const venda = await updateVendaService(id as string, req.body);
  res.status(200).json(venda);
};

export const deleteVendaController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteVendaService(id as string);
  res.status(204).send();
};