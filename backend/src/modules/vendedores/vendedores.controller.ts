import { type Request, type Response } from "express";
import { VendedorService } from "./vendedores.service";
import {
  CreateVendedorSchema,
  UpdateVendedorSchema,
} from "./vendedores.dto";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";

const vendedorService = new VendedorService();

export const createVendedorController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("Requisição de criação de vendedor recebida:", req.body);
    const { empresaId } = req.user!;
    const data = CreateVendedorSchema.parse(req.body);

    if (req.file) {
      (data as any).urlImagem = `uploads/vendedores/${req.file.filename}`;
    }

    const vendedor = await vendedorService.create(data, empresaId);
    res.status(201).json(vendedor);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getVendedoresController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const vendedores = await vendedorService.findAll(empresaId);
    res.json(vendedores);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getVendedorByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const vendedor = await vendedorService.findOne(
      req.params.id as string,
      empresaId
    );
    if (!vendedor) {
      return res.status(404).json({ message: "Vendedor not found" });
    }
    res.json(vendedor);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateVendedorController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const data = UpdateVendedorSchema.parse(req.body);
    
    if (req.file) {
      (data as any).urlImagem = `uploads/vendedores/${req.file.filename}`;
    }

    const vendedor = await vendedorService.update(
      req.params.id as string,
      data,
      empresaId
    );
    res.json(vendedor);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteVendedorController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    await vendedorService.remove(req.params.id as string, empresaId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
