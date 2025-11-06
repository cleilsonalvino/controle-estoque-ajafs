import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors";
import { type CreateVendedorDto, type UpdateVendedorDto } from "./vendedores.dto";

const prisma = new PrismaClient();

export class VendedorService {
  async create(data: CreateVendedorDto, empresaId: string) {
    const codigoVendedor = function generateCodigoVendedor() {
      return "VEN-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    };
    return await prisma.vendedor.create({
      data: {
        ...data,
        empresaId,
        codigo: codigoVendedor(),
      },
    });
  }

  async findAll(empresaId: string) {
    return await prisma.vendedor.findMany({ where: { empresaId } });
  }

  async findOne(id: string, empresaId: string) {
    const vendedor = await prisma.vendedor.findFirst({
      where: { id, empresaId },
    });
    if (!vendedor) {
      throw new CustomError("Vendedor não encontrado", 404);
    }
    return vendedor;
  }

  async update(id: string, data: UpdateVendedorDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return await prisma.vendedor.update({
      where: { id, empresaId },
      data: data as any,
    });
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return await prisma.vendedor.delete({ where: { id, empresaId } });
  }
}

