import { PrismaClient } from '@prisma/client';
import { type CreateEmpresaDto, type UpdateEmpresaDto } from './empresa.dto.ts';

const prisma = new PrismaClient();

export class EmpresaService {
  async create(data: CreateEmpresaDto) {
    return await prisma.empresa.create({
      data: {
        nome: data.nome,
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia,
        inscEstadual: data.inscEstadual,
        inscMunicipal: data.inscMunicipal,
        telefone: data.telefone,
        numero: data.numero,
        complemento: data.complemento ?? null,
        email: data.email ?? null,
        cnae: data.cnae,
        cnpj: data.cnpj,
        cep: data.cep,
        estado: data.estado,
        cidade: data.cidade,
        endereco: data.endereco,
        bairro: data.bairro,
      },
    });

  }

  async findAll() {
    return await prisma.empresa.findMany();
  }

  async findOne(id: string) {
    return await prisma.empresa.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateEmpresaDto) {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );
    return await prisma.empresa.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    return await prisma.empresa.delete({ where: { id } });
  }
}
