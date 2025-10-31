import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const createUserService = async (data: any, empresaId: string) => {
  const hashedPassword = await hash(data.senha, 10);
  const user = await prisma.usuario.create({
    data: {
      ...data,
      senha: hashedPassword,
      empresaId,
    },
  });
  return user;
};

export const getUsersService = async (empresaId: string) => {
  const users = await prisma.usuario.findMany({ where: { empresaId } });
  return users;
};

export const getUserByIdService = async (id: string, empresaId: string) => {
  const user = await prisma.usuario.findFirst({
    where: { id, empresaId },
  });
  if (!user) {
    throw new CustomError("Usuário não encontrado", 404);
  }
  return user;
};

export const updateUserService = async (
  id: string,
  data: any,
  empresaId: string
) => {
  await getUserByIdService(id, empresaId);
  if (data.senha) {
    data.senha = await hash(data.senha, 10);
  }
  const user = await prisma.usuario.update({
    where: { id, empresaId },
    data,
  });
  return user;
};

export const deleteUserService = async (id: string, empresaId: string) => {
  await getUserByIdService(id, empresaId);
  await prisma.usuario.delete({
    where: { id, empresaId },
  });
};