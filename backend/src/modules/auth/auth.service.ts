import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const loginService = async (data: any) => {
  const { email, senha } = data;

  const user = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!user) {
    throw new CustomError("Email ou senha inválidos", 401);
  }

  const passwordMatch = await compare(senha, user.senha);

  if (!passwordMatch) {
    throw new CustomError("Email ou senha inválidos", 401);
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "1d",
  });

  return { user, token };
};

export const getUserDataFromToken = async (token: string) => { 
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      throw new CustomError("Usuário não encontrado", 404);
    }
    return user;
  } catch (error) {
    throw new CustomError("Token inválido ou expirado", 401);
  }
};