// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1) Empresa
  const empresa = await prisma.empresa.create({
    data: {
      nome: 'AJAFS Matriz',
      cnpj: '12345678000100',
      telefone: '(79) 99999-9999',
      razaoSocial: 'AJAFS LTDA',
      nomeFantasia: 'AJAFS',
      cep: '49000-000',
      estado: 'SE',
      cidade: 'Aracaju',
      endereco: 'Rua Central',
      numero: '100',
      bairro: 'Centro',
    },
  });

  // 2) Usuário (admin)
  await prisma.usuario.create({
    data: {
      nome: 'Admin',
      email: 'admin@ajafs.com',
      senha: 'senha_hash_ou_provisoria',
      papel: 'ADMINISTRADOR',
      empresaId: empresa.id,
    },
  });

  // 3) Categoria e Fornecedor
  const categoria = await prisma.categoriaProduto.create({
    data: { nome: 'Bebidas', empresaId: empresa.id },
  });

  const fornecedor = await prisma.fornecedor.create({
    data: {
      nome: 'Distribuidora Norte',
      email: 'contato@forn.com',
      empresaId: empresa.id,
    },
  });

  // 4) Produto
  const produto = await prisma.produto.create({
    data: {
      nome: 'Água Mineral 500ml',
      codigoBarras: '789000000001',
      descricao: 'Garrafa 500ml',
      precoVenda: new Prisma.Decimal(2.50),
      estoqueMinimo: new Prisma.Decimal(12),
      empresaId: empresa.id,
      categoriaId: categoria.id,
      fornecedorId: fornecedor.id,
    },
  });

  // 5) Lote inicial
  const lote = await prisma.lote.create({
    data: {
      produtoId: produto.id,
      empresaId: empresa.id,
      precoCusto: new Prisma.Decimal(1.50),
      quantidadeAtual: new Prisma.Decimal(100),
      dataCompra: new Date(),
    },
  });

  // 6) Movimentação de entrada (opcional, se quiser registrar o lote como entrada)
  await prisma.movimentacao.create({
    data: {
      produtoId: produto.id,
      loteId: lote.id,
      empresaId: empresa.id,
      tipo: 'ENTRADA',
      quantidade: new Prisma.Decimal(100),
      observacao: 'Estoque inicial',
    },
  });

  // 7) Cliente e Vendedor
  const cliente = await prisma.cliente.create({
    data: {
      nome: 'Cliente Exemplo',
      email: 'cliente@exemplo.com',
      empresaId: empresa.id,
    },
  });

  const vendedor = await prisma.vendedor.create({
    data: {
      nome: 'Vendedor 1',
      email: 'vendedor1@ajafs.com',
      empresaId: empresa.id,
    },
  });

  // 8) Venda com ItemVenda
const venda = await prisma.venda.create({
  data: {
    numero: 'V-000001',
    clienteId: cliente.id,
    vendedorId: vendedor.id,
    empresaId: empresa.id, // ✅ usa direto
    total: new Prisma.Decimal(5.00),
    status: 'Concluída',
    tipoVenda: 'Produto',
    itens: {
      create: [
        {
          produtoId: produto.id,
          quantidade: new Prisma.Decimal(2),
          precoUnitario: new Prisma.Decimal(2.50),
          empresaId: empresa.id, // ✅ idem
        },
      ],
    },
  },
  include: { itens: true },
});


  console.log('Seed finalizado com sucesso:', { empresa: empresa.id, venda: venda.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
