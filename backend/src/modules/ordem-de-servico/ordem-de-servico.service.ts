
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { CreateOrdemDeServicoSchema, UpdateOrdemDeServicoSchema } from './ordem-de-servico.dto';

const prisma = new PrismaClient();

export class OrdemDeServicoService {
  async findAll(empresaId: string, filters: any) {
    const cleanedFilters: any = {};

    // Só copia para cleanedFilters se tiver valor
    for (const key in filters) {
      const value = filters[key];

      if (value !== "" && value !== undefined && value !== null) {
        cleanedFilters[key] = value;
      }
    }

    return prisma.ordemDeServico.findMany({
      where: {
        empresaId,
        ...cleanedFilters,
      },
      include: {
        servico: true,
        cliente: true,
        responsavel: true,
      },
    });
  }

  async findOne(id: string, empresaId: string) {
    return prisma.ordemDeServico.findUnique({
      where: { id, empresaId },
      include: {
        servico: true,
        cliente: true,
        responsavel: true,
        venda: true,
      },
    });
  }

  async create(data: z.infer<typeof CreateOrdemDeServicoSchema>, empresaId: string) {
    return prisma.ordemDeServico.create({
      data: { ...data, empresaId },
    });
  }

  async update(id: string, data: z.infer<typeof UpdateOrdemDeServicoSchema>, empresaId: string) {
    return prisma.ordemDeServico.update({
      where: { id, empresaId },
      data,
    });
  }
}

