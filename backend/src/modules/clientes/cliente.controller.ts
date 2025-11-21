import { type Request, type Response } from 'express';
import { ClienteService } from './cliente.service';
import { CreateClienteSchema, UpdateClienteSchema } from './cliente.dto';
import type { AuthenticatedRequest } from '../../app/middlewares/auth.middleware.ts';


const clienteService = new ClienteService();

export const createClienteController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("Requisição de criação de cliente recebida:", req.body);
    const { empresaId } = req.user!;
    const data = CreateClienteSchema.parse(req.body);
    const cliente = await clienteService.create(data, empresaId);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getClientesController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const clientes = await clienteService.findAll(empresaId);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getClienteByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const cliente = await clienteService.findOne(req.params.id as string, empresaId);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente not found' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateClienteController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const data = UpdateClienteSchema.parse(req.body);
    const cliente = await clienteService.update(req.params.id as string, data, empresaId);
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteClienteController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    await clienteService.remove(req.params.id as string, empresaId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
