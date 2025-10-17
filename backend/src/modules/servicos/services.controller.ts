import { type Request, type Response } from 'express';
import { ServiceService } from './services.service.ts';
import { type CreateServiceDto, type UpdateServiceDto } from './services.dto.ts';

const serviceService = new ServiceService();

export class ServiceController {
  async create(req: Request, res: Response) {
    const service = await serviceService.create(req.body as CreateServiceDto);
    res.status(201).json(service);
  }

  async getAll(req: Request, res: Response) {
    const result = await serviceService.getAll(req.query);
    res.status(200).json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const service = await serviceService.getById(id as string);
    res.status(200).json(service);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const service = await serviceService.update(id as string, req.body as UpdateServiceDto);
    res.status(200).json(service);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await serviceService.delete(id as string);
    res.status(204).send();
  }
}
