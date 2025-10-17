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