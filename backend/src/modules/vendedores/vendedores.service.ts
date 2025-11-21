import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors";
import {
  type CreateVendedorDto,
  type UpdateVendedorDto,
} from "./vendedores.dto";
import fs from "fs";
import path from "path";

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
    return await prisma.vendedor.findMany({
      where: { empresaId },
      select:{
        atualizadoEm: true,
        criadoEm: true,
        email: true,
        id: true,
        meta: true,
        nome: true,
        urlImagem: true,
        codigo: true,
      }
    });
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
    const oldVendedor = await this.findOne(id, empresaId);

    if ((data as any).urlImagem && oldVendedor.urlImagem) {
      const oldImagePath = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        oldVendedor.urlImagem
      );
      fs.unlink(oldImagePath, (err) => {
        if (err)
          console.error("Erro ao deletar imagem antiga do vendedor:", err);
      });
    }

    return await prisma.vendedor.update({
      where: { id, empresaId },
      data: data as any,
    });
  }

  async remove(id: string, empresaId: string) {
    const vendedor = await this.findOne(id, empresaId);

    await prisma.vendedor.delete({ where: { id, empresaId } });

    if (vendedor.urlImagem) {
      const imagePath = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        vendedor.urlImagem
      );
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Erro ao deletar imagem do vendedor:", err);
      });
    }
  }
}
