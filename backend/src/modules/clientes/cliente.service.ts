import { PrismaClient } from '@prisma/client';
import { type CreateClienteDto, type UpdateClienteDto } from './cliente.dto';

const prisma = new PrismaClient();

export class ClienteService {
  async create(data: CreateClienteDto, empresaId: string) {
    const codigoCliente = function generateCodigoCliente() {
      return 'CLT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    return await prisma.cliente.create({
      data: {
        ...data,
        empresaId,
        codigo: codigoCliente(),
      },
    });

  }

  async findAll(empresaId: string) {
    return await prisma.cliente.findMany({ where: { empresaId } });
  }

  async findOne(id: string, empresaId: string) {
    return await prisma.cliente.findFirst({ where: { id, empresaId } });
  }

  async update(id: string, data: UpdateClienteDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return await prisma.cliente.update({ where: { id, empresaId }, data: data as any});
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return await prisma.cliente.delete({ where: { id, empresaId } });
  }
}

