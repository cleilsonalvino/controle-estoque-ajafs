import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors";

const prisma = new PrismaClient();

export const createSupplierService = async (data: any, empresaId: string) => {
  const supplier = await prisma.fornecedor.create({
    data: {
      ...data,
      empresaId,
    },
  });
  return supplier;
};

export const getSuppliersService = async (empresaId: string) => {
  const suppliers = await prisma.fornecedor.findMany({ where: { empresaId } });
  return suppliers;
};

export const getSupplierByIdService = async (id: string, empresaId: string) => {
  const supplier = await prisma.fornecedor.findFirst({
    where: { id, empresaId },
  });
  if (!supplier) {
    throw new CustomError("Fornecedor não encontrado", 404);
  }
  return supplier;
};

export const updateSupplierService = async (
  id: string,
  data: any,
  empresaId: string
) => {
  await getSupplierByIdService(id, empresaId);
  const supplier = await prisma.fornecedor.update({
    where: { id, empresaId },
    data,
  });
  return supplier;
};

export const deleteSupplierService = async (id: string, empresaId: string) => {
  await getSupplierByIdService(id, empresaId);
  await prisma.fornecedor.delete({
    where: { id, empresaId },
  });
};
