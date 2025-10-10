import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const createSupplierService = async (data: any) => {
  const supplier = await prisma.fornecedor.create({
    data,
  });
  return supplier;
};

export const getSuppliersService = async () => {
  const suppliers = await prisma.fornecedor.findMany();
  return suppliers;
};

export const getSupplierByIdService = async (id: string) => {
  const supplier = await prisma.fornecedor.findUnique({
    where: { id },
  });
  if (!supplier) {
    throw new AppError("Fornecedor não encontrado", 404);
  }
  return supplier;
};

export const updateSupplierService = async (id: string, data: any) => {
  const supplier = await prisma.fornecedor.update({
    where: { id },
    data,
  });
  return supplier;
};

export const deleteSupplierService = async (id: string) => {
  await prisma.fornecedor.delete({
    where: { id },
  });
};