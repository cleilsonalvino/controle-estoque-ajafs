import { PrismaClient } from '@prisma/client';
import { type CreateClienteDto, type UpdateClienteDto } from './cliente.dto';

const prisma = new PrismaClient();

export class ClienteService {
  async create(data: CreateClienteDto, empresaId: string) {
    return await prisma.cliente.create({ data: { ...data, empresaId } as any });
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

