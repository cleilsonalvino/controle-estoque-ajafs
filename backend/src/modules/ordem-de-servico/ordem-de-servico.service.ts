import { PrismaClient, StatusOrdemDeServico } from "@prisma/client";
import { z } from "zod";
import {
  CreateOrdemDeServicoSchema,
  UpdateOrdemDeServicoSchema,
} from "./ordem-de-servico.dto";

const prisma = new PrismaClient();

export class OrdemDeServicoService {
  async findAll(empresaId: string, filters: any) {
    const cleanedFilters: any = {};

    for (const key in filters) {
      const value = filters[key];
      if (value !== "" && value !== undefined && value !== null) {
        cleanedFilters[key] = value;
      }
    }

return prisma.ordemDeServico.findMany({
  where: {
    empresaId,
    ...cleanedFilters,
  },
  include: {
    cliente: true,
    responsavel: true,
    servico: {
      select: {
        nome: true,
      },
    },
  },
  orderBy: { criadoEm: "desc" },
});

  }

  async findOne(id: string, empresaId: string) {
    return prisma.ordemDeServico.findUnique({
      where: { id, empresaId },
      include: {
        cliente: true,
        responsavel: true,
      },
    });
  }

  async create(
    data: z.infer<typeof CreateOrdemDeServicoSchema>,
    empresaId: string
  ) {
    return prisma.ordemDeServico.create({
      data: {
        empresaId,
        clienteId: data.clienteId,
        responsavelId: data.responsavelId,
        identificacaoItem: data.identificacaoItem,
        problemaRelatado: data.problemaRelatado,
        observacoes: data.observacoes,
        status: StatusOrdemDeServico.PENDENTE,
        servicoId: data.servicoId,
      },
    });
  }

  async update(
    id: string,
    data: z.infer<typeof UpdateOrdemDeServicoSchema>,
    empresaId: string
  ) {
    return prisma.ordemDeServico.update({
      where: { id, empresaId },
      data,
    });
  }

  async delete(id: string, empresaId: string) {
    return prisma.ordemDeServico.delete({
      where: { id, empresaId },
    });
  }
}
