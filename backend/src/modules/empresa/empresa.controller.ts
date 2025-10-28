import { type Request, type Response } from 'express';
import { EmpresaService } from './empresa.service.ts';
import { CreateEmpresaSchema, UpdateEmpresaSchema } from './empresa.dto.ts';
import { Prisma } from '@prisma/client';
import z from 'zod';

const empresaService = new EmpresaService();

export const createEmpresaController = async (req: Request, res: Response) => {
  try {
    console.log("Body recebido:", req.body);

    // Validação Zod
    const data = CreateEmpresaSchema.parse(req.body);
    console.log("Dados validados:", data);

    // Criação no banco
    const empresa = await empresaService.create(data);
    res.status(201).json(empresa);
  } catch (error) {
    console.error("Erro ao criar empresa:", error);

    // Se for erro de Zod, você pode detalhar os issues
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Erro de validação", issues: error.errors });
    }

    // Se for erro do Prisma (ex: violação de unique)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "CNPJ ou email já existe no banco" });
      }
    }

    // Qualquer outro erro
    res.status(500).json({ message: "Erro interno do servidor" });
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