import { type Request, type Response } from 'express';
import { EmpresaService } from './empresa.service.ts';
import { CreateEmpresaSchema, UpdateEmpresaSchema } from './empresa.dto.ts';

const empresaService = new EmpresaService();

export const createEmpresaController = async (req: Request, res: Response) => {
  try {
    const data = CreateEmpresaSchema.parse(req.body);
    
    const empresa = await empresaService.create(data);
    res.status(201).json(empresa);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getEmpresasController = async (req: Request, res: Response) => {
  try {
    const empresas = await empresaService.findAll();
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getEmpresaByIdController = async (req: Request, res: Response) => {
  try {
    const empresa = await empresaService.findOne(req.params.id as string);
    if (!empresa) {
      return res.status(404).json({ message: 'Empresa not found' });
    }
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateEmpresaController = async (req: Request, res: Response) => {
  try {
    const data = UpdateEmpresaSchema.parse(req.body);
    const empresa = await empresaService.update(req.params.id as string, data);
    res.json(empresa);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteEmpresaController = async (req: Request, res: Response) => {
  try {
    await empresaService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};