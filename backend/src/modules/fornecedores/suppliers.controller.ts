import { type Request, type Response } from "express";
import {
  createSupplierService,
  getSuppliersService,
  getSupplierByIdService,
  updateSupplierService,
  deleteSupplierService,
} from "./suppliers.service.ts";

import { createSupplierSchema, updateSupplierSchema } from "./suppliers.dto.ts";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware.ts";


export const createSupplierController = async (req: AuthenticatedRequest, res: Response) => {
  const { empresaId } = req.user!;
  const validation = createSupplierSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do fornecedor",
      details: validation.error.format(), // mostra exatamente o campo errado
    });
  }

  const supplier = await createSupplierService(req.body, empresaId);
  res.status(201).json(supplier);
};

export const getSuppliersController = async (req: AuthenticatedRequest, res: Response) => {
  const { empresaId } = req.user!;
  const suppliers = await getSuppliersService(empresaId);
  res.status(200).json(suppliers);
};

export const getSupplierByIdController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const supplier = await getSupplierByIdService(id as string, empresaId);
  res.status(200).json(supplier);
};

export const updateSupplierController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;

  const validation = updateSupplierSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do fornecedor",
      details: validation.error.format(),
    });
  }

  const supplier = await updateSupplierService(id as string, req.body, empresaId);
  res.status(200).json(supplier);
};

export const deleteSupplierController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  await deleteSupplierService(id as string, empresaId);
  res.status(204).send();
};