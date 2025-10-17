import { Prisma, PrismaClient } from '@prisma/client';
import { type CreateServiceDto, type UpdateServiceDto } from './services.dto.ts';
import { CustomError } from '../../shared/errors.ts';

const prisma = new PrismaClient();

export class ServiceService {
  async create(data: CreateServiceDto) {
    const existingService = await prisma.servico.findUnique({
      where: { nome: data.nome },
    });

    if (existingService) {
      throw new CustomError('Um serviço com este nome já existe.', 409);
    }

    const service = await prisma.servico.create({
      data:{
        nome: data.nome,
        descricao: data.descricao,
        precoCusto: data.precoCusto,
        precoVenda: data.precoVenda,
        duracaoMinutos: data.duracaoMinutos,
        categoriaId: data.categoriaId || undefined,
      } as Prisma.ServicoCreateInput,
    }); 

    return service;
  }

  async getAll(query: any) {
    const { page = 1, limit = 10, sortBy = 'nome', order = 'asc' } = query;
    const skip = (page - 1) * limit;

    const services = await prisma.servico.findMany({
      skip,
      take: Number(limit),
      orderBy: {
        [sortBy]: order,
      },
    });

    const total = await prisma.servico.count();

    return { data: services, total };
  }

  async getById(id: string) {
    const service = await prisma.servico.findUnique({
      where: { id },
    });

    if (!service) {
      throw new CustomError('Serviço não encontrado.', 404);
    }

    return service;
  }

  async update(id: string, data: UpdateServiceDto) {
    await this.getById(id); // Garante que o serviço existe

    if (data.nome) {
      const existingService = await prisma.servico.findFirst({
        where: {
          nome: data.nome,
          id: { not: id },
        },
      });

      if (existingService) {
        throw new CustomError('Já existe outro serviço com este nome.', 409);
      }
    }

    const service = await prisma.servico.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        precoCusto: data.precoCusto,
        precoVenda: data.precoVenda,
        duracaoMinutos: data.duracaoMinutos,
        categoriaId: data.categoriaId || undefined,
      } as Prisma.ServicoUpdateInput,
    }); 

    return service;
  }

  async delete(id: string) {
    await this.getById(id); // Garante que o serviço existe

    await prisma.servico.delete({
      where: { id },
    });
  }
}
