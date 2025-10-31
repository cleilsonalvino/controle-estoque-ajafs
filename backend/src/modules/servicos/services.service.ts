import { Prisma, PrismaClient } from "@prisma/client";
import { type CreateServiceDto, type UpdateServiceDto } from "./services.dto.ts";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export class ServiceService {
  async create(data: CreateServiceDto, empresaId: string) {
    const existingService = await prisma.servico.findFirst({
      where: { nome: data.nome, empresaId },
    });

    if (existingService) {
      throw new CustomError("Um serviço com este nome já existe.", 409);
    }

    const service = await prisma.servico.create({
      data: {
        ...(data as any),
        empresaId,
      },
    });

    return service;
  }

  async getAll(empresaId: string) {
    const services = await prisma.servico.findMany({ where: { empresaId } });
    return services;
  }

  async getById(id: string, empresaId: string) {
    const service = await prisma.servico.findFirst({
      where: { id, empresaId },
    });

    if (!service) {
      throw new CustomError("Serviço não encontrado.", 404);
    }

    return service;
  }

  async update(id: string, data: UpdateServiceDto, empresaId: string) {
    await this.getById(id, empresaId); // Garante que o serviço existe na empresa

    if (data.nome) {
      const existingService = await prisma.servico.findFirst({
        where: {
          nome: data.nome,
          id: { not: id },
          empresaId,
        },
      });

      if (existingService) {
        throw new CustomError("Já existe outro serviço com este nome.", 409);
      }
    }

    const service = await prisma.servico.update({
      where: { id, empresaId },
      data: data as any,
    });

    return service;
  }

  async delete(id: string, empresaId: string) {
    await this.getById(id, empresaId); // Garante que o serviço existe na empresa

    await prisma.servico.delete({
      where: { id, empresaId },
    });
  }
}

