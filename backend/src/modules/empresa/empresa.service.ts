import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors";

const prisma = new PrismaClient();

export const empresaService = {
  // Esta função provavelmente deve ser restrita a um super-admin
  getAll: async () => prisma.empresa.findMany(),

  // A criação de empresa é um processo sensível, pode não pertencer a um usuário comum
  create: async (data: any) => prisma.empresa.create({ data }),

  getById: async (id: string, empresaId: string) => {
    if (id !== empresaId) {
      throw new CustomError("Acesso não autorizado.", 403);
    }
    const empresa = await prisma.empresa.findUnique({ where: { id } });
    if (!empresa) {
      throw new CustomError("Empresa não encontrada", 404);
    }
    return empresa;
  },

  update: async (id: string, data: any, empresaId: string) => {
    if (id !== empresaId) {
      throw new CustomError("Acesso não autorizado.", 403);
    }
    return prisma.empresa.update({ where: { id }, data });
  },

  // Esta função provavelmente deve ser restrita a um super-admin
  remove: async (id: string) => prisma.empresa.delete({ where: { id } }),
};
