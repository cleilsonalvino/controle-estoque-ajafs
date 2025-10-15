import { type Request, type Response } from 'express';
import { ClienteService } from './cliente.service.ts';
import { CreateClienteSchema, UpdateClienteSchema } from './cliente.dto.ts';

const clienteService = new ClienteService();

export const createClienteController = async (req: Request, res: Response) => {
  try {
    const data = CreateClienteSchema.parse(req.body);
    const cliente = await clienteService.create(data);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getClientesController = async (req: Request, res: Response) => {
  try {
    const clientes = await clienteService.findAll();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getClienteByIdController = async (req: Request, res: Response) => {
  try {
    const cliente = await clienteService.findOne(req.params.id as string);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente not found' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateClienteController = async (req: Request, res: Response) => {
  try {
    const data = UpdateClienteSchema.parse(req.body);
    const cliente = await clienteService.update(req.params.id as string, data);
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteClienteController = async (req: Request, res: Response) => {
  try {
    await clienteService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
