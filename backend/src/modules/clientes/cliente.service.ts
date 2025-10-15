import { PrismaClient } from '@prisma/client';
import { type CreateClienteDto, type UpdateClienteDto } from './cliente.dto.ts';

const prisma = new PrismaClient();

export class ClienteService {
  async create(data: CreateClienteDto) {
    return await prisma.cliente.create({ data: data as any });
  }

  async findAll() {
    return await prisma.cliente.findMany();
  }

  async findOne(id: string) {
    return await prisma.cliente.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateClienteDto) {
    return await prisma.cliente.update({ where: { id }, data: data as any});
  }

  async remove(id: string) {
    return await prisma.cliente.delete({ where: { id } });
  }
}
