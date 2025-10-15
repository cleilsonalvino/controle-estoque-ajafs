import { PrismaClient } from '@prisma/client';
import { type CreateVendedorDto, type UpdateVendedorDto } from './vendedores.dto.ts';

const prisma = new PrismaClient();

export class VendedorService {
  async create(data: CreateVendedorDto) {
    return await prisma.vendedor.create({ data: data as any });
  }

  async findAll() {
    return await prisma.vendedor.findMany();
  }

  async findOne(id: string) {
    return await prisma.vendedor.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateVendedorDto) {
    return await prisma.vendedor.update({ where: { id }, data: data as any});
  }

  async remove(id: string) {
    return await prisma.vendedor.delete({ where: { id } });
  }
}
