import { type Request, type Response } from "express";
import {
  createSupplierService,
  getSuppliersService,
  getSupplierByIdService,
  updateSupplierService,
  deleteSupplierService,
} from "./suppliers.service.ts";

import { createSupplierSchema, updateSupplierSchema } from "./suppliers.dto.ts";

export const createSupplierController = async (req: Request, res: Response) => {
  console.log("Requisição recebida para criar fornecedor:", req.body);

  const validation = createSupplierSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do fornecedor",
      details: validation.error.format(), // mostra exatamente o campo errado
    });
  }

  const supplier = await createSupplierService(req.body);
  res.status(201).json(supplier);
};

export const getSuppliersController = async (req: Request, res: Response) => {
  const suppliers = await getSuppliersService();
  res.status(200).json(suppliers);
};

export const getSupplierByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = await getSupplierByIdService(id as string);
  res.status(200).json(supplier);
};

export const updateSupplierController = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validation = updateSupplierSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do fornecedor",
      details: validation.error.format(),
    });
  }

  const supplier = await updateSupplierService(id as string, req.body);
  res.status(200).json(supplier);
};

export const deleteSupplierController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteSupplierService(id as string);
  res.status(204).send();
};