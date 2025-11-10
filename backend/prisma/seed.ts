// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1) Empresa
  const empresa = await prisma.empresa.create({
    data: {
      nome: 'CENTRO DE REPARACAO AUTOMOTIVA LTDA',
      cnpj: '30390419000123',
      telefone: '79998414037',
      razaoSocial: '',
      nomeFantasia: 'C.R.A CENTRO DE REPARACAO AUTOMOTIVA',
      cep: '49000-000',
      estado: 'SE',
      cidade: 'TOBIAS BARRETO',
      endereco: 'ROD JOAO VALERIANO DOS SANTOS',
      numero: '2181',
      bairro: 'BELA VISTA',
    },
  });

  // 2) Usuário (admin)
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'CRA Admin',
      email: 'admin@ajafs.com',
      senha: '$2a$12$V/CA2x6172q.uBmf8PFXHe79yZ9YFd6414a1N8ZIkiIWEGLQTKCFe',
      papel: 'ADMINISTRADOR',
      empresaId: empresa.id,
    },
  });




  console.log('Seed finalizado com sucesso:', { empresa: empresa.id, usuario: usuario.email, senha: 'admin123' });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
