import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomError } from "../../shared/errors";

const prisma = new PrismaClient();

export const loginService = async (data: any) => {
  const { email, senha } = data;

  console.log("Login attempt for email:", email, senha); // Debug log

  const user = await prisma.usuario.findUnique({
    where: { email },
    include: { empresa: true }, // ✅ incluir empresa no retorno
  });

  if (!user) {
    throw new CustomError("Email ou senha inválidos", 401);
  }

  const passwordMatch = await compare(senha, user.senha);
  if (!passwordMatch) {
    throw new CustomError("Email ou senha inválidos", 401);
  }

  // ✅ incluir empresaId e papel no token
  const token = jwt.sign(
    {
      id: user.id,
      empresaId: user.empresaId,
      papel: user.papel,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" }
  );

  // ✅ retornar o usuário com empresa + token
  return {
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      empresa: user.empresa,
    },
    token,
  };
};

export const getUserDataFromToken = async (token: string) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new CustomError("Chave JWT não configurada no servidor", 500);
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: { empresa: true },
    });

    if (!user) throw new CustomError("Usuário não encontrado", 404);

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      empresa: user.empresa,
    };
  } catch {
    throw new CustomError("Token inválido ou expirado", 401);
  }
};
