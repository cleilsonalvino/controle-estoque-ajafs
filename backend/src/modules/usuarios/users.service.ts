import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { AppError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const createUserService = async (data: any) => {
  const hashedPassword = await hash(data.senha, 10);
  const user = await prisma.usuario.create({
    data: {
      ...data,
      senha: hashedPassword,
    },
  });
  return user;
};

export const getUsersService = async () => {
  const users = await prisma.usuario.findMany();
  return users;
};

export const getUserByIdService = async (id: string) => {
  const user = await prisma.usuario.findUnique({
    where: { id },
  });
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }
  return user;
};

export const updateUserService = async (id: string, data: any) => {
  if (data.senha) {
    data.senha = await hash(data.senha, 10);
  }
  const user = await prisma.usuario.update({
    where: { id },
    data,
  });
  return user;
};

export const deleteUserService = async (id: string) => {
  await prisma.usuario.delete({
    where: { id },
  });
};