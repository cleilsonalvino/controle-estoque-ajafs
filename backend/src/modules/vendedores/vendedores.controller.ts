import { type Request, type Response } from 'express';
import { VendedorService } from './vendedores.service.ts';
import { CreateVendedorSchema, UpdateVendedorSchema } from './vendedores.dto.ts';

const vendedorService = new VendedorService();

export const createVendedorController = async (req: Request, res: Response) => {
  try {
    const data = CreateVendedorSchema.parse(req.body);
    const vendedor = await vendedorService.create(data);
    res.status(201).json(vendedor);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getVendedoresController = async (req: Request, res: Response) => {
  try {
    const vendedores = await vendedorService.findAll();
    res.json(vendedores);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getVendedorByIdController = async (req: Request, res: Response) => {
  try {
    const vendedor = await vendedorService.findOne(req.params.id as string);
    if (!vendedor) {
      return res.status(404).json({ message: 'Vendedor not found' });
    }
    res.json(vendedor);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateVendedorController = async (req: Request, res: Response) => {
  try {
    const data = UpdateVendedorSchema.parse(req.body);
    const vendedor = await vendedorService.update(req.params.id as string, data);
    res.json(vendedor);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteVendedorController = async (req: Request, res: Response) => {
  try {
    await vendedorService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};