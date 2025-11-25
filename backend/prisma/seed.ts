import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const uniq = () => faker.string.uuid();
const money = () => Number(faker.finance.amount({ min: 10, max: 1500, dec: 2 }));
const qty = () => Number(faker.finance.amount({ min: 1, max: 200, dec: 3 }));
const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

async function criarEmpresa(nome: string, segmento: string) {
  return prisma.empresa.create({
    data: {
      nome,
      cnpj: faker.string.numeric(14),
      telefone: faker.phone.number(),
      email: faker.internet.email(),
      razaoSocial: nome,
      nomeFantasia: nome,
      cep: faker.location.zipCode(),
      estado: "SE",
      cidade: "Aracaju",
      endereco: faker.location.streetAddress(),
      numero: faker.string.numeric(3),
      bairro: faker.location.city(),
    },
  });
}

async function main() {
  console.log("🌱 Iniciando seed profissional...");

  // ===========================================================================
  // 1) EMPRESAS
  // ===========================================================================
  const empresa1 = await criarEmpresa(
    "TechMaster Comércio de Eletrônicos LTDA",
    "Eletrônicos"
  );

  const empresa2 = await criarEmpresa(
    "Moda Bella Roupas e Acessórios ME",
    "Moda"
  );

  const empresas = [empresa1, empresa2];

  // ===========================================================================
  // 2) USUÁRIOS
  // ===========================================================================
  for (const empresa of empresas) {
    await prisma.usuario.createMany({
      data: [
        {
          nome: "Administrador",
          email: `admin@${empresa.nomeFantasia}.com`,
          senha: "123456",
          papel: "ADMINISTRADOR",
          empresaId: empresa.id,
        },
        ...Array.from({ length: 4 }).map(() => ({
          nome: faker.person.fullName(),
          email: faker.internet.email() + uniq(),
          senha: "123456",
          empresaId: empresa.id,
        })),
      ],
    });
  }

  console.log("Usuários criados.");

  // ===========================================================================
  // 3) CATEGORIAS POR SEGMENTO
  // ===========================================================================
  const categoriasEmpresa1 = [
    "Smartphones",
    "Notebooks",
    "Acessórios",
    "Áudio",
    "Periféricos",
  ];

  const categoriasEmpresa2 = [
    "Feminino",
    "Masculino",
    "Infantil",
    "Acessórios",
    "Calçados",
  ];

  const categoriasMap = {
    [empresa1.id]: categoriasEmpresa1,
    [empresa2.id]: categoriasEmpresa2,
  };

  const categoriasCriadas: Record<string, any[]>= {};

  for (const empresa of empresas) {
    categoriasCriadas[empresa.id] = [];

    for (const cat of categoriasMap[empresa.id]) {
      const nova = await prisma.categoriaProduto.create({
        data: {
          nome: cat,
          empresaId: empresa.id,
        },
      });
      categoriasCriadas[empresa.id].push(nova);
    }
  }

  console.log("Categorias criadas.");

  // ===========================================================================
  // 4) MARCAS
  // ===========================================================================
  const marcasBase = {
    [empresa1.id]: ["Samsung", "Apple", "LG", "Xiaomi", "Dell"],
    [empresa2.id]: ["Zara", "Renner", "Hering", "Nike", "Colcci"],
  };

  const marcasCriadas: Record<string, any[]>= {};

  for (const empresa of empresas) {
    marcasCriadas[empresa.id] = [];

    for (const m of marcasBase[empresa.id]) {
      const nova = await prisma.marca.create({
        data: {
          nome: m,
          empresaId: empresa.id,
        },
      });

      marcasCriadas[empresa.id].push(nova);
    }
  }

  console.log("Marcas criadas.");

  // ===========================================================================
  // 5) FORNECEDORES
  // ===========================================================================
  const fornecedoresCriados: Record<string, any[]>= {};

  for (const empresa of empresas) {
    fornecedoresCriados[empresa.id] = [];

    for (let i = 0; i < 10; i++) {
      fornecedoresCriados[empresa.id].push(
        await prisma.fornecedor.create({
          data: {
            nome: faker.company.name() + " Distribuidora",
            telefone: faker.phone.number(),
            email: faker.internet.email() + uniq(),
            empresaId: empresa.id,
          },
        })
      );
    }
  }

  console.log("Fornecedores criados.");

  // ===========================================================================
  // 6) PRODUTOS PROFISSIONAIS
  // ===========================================================================
  const produtosCriados: Record<string, any[]>= {};

  for (const empresa of empresas) {
    produtosCriados[empresa.id] = [];

    for (let i = 0; i < 20; i++) {
      const categoria = rand(categoriasCriadas[empresa.id]);
      const marca = rand(marcasCriadas[empresa.id]);
      const fornecedor = rand(fornecedoresCriados[empresa.id]);

      produtosCriados[empresa.id].push(
        await prisma.produto.create({
          data: {
            nome: `${marca.nome} ${categoria.nome} ${i + 1}`,
            codigoBarras: faker.string.numeric(13) + uniq(),
            precoVenda: money(),
            estoqueMinimo: qty(),
            categoriaId: categoria.id,
            fornecedorId: fornecedor.id,
            marcaId: marca.id,
            empresaId: empresa.id,
          },
        })
      );
    }
  }

  console.log("Produtos criados.");

  // ===========================================================================
  // 7) CLIENTES
  // ===========================================================================
  const clientesCriados: Record<string, any[]>= {};

  for (const empresa of empresas) {
    clientesCriados[empresa.id] = [];

    for (let i = 0; i < 20; i++) {
      clientesCriados[empresa.id].push(
        await prisma.cliente.create({
          data: {
            nome: faker.person.fullName(),
            codigo: "CLI-" + uniq(),
            cpf: faker.string.numeric(11) + uniq(),
            email: faker.internet.email() + uniq(),
            telefone: faker.phone.number(),
            empresaId: empresa.id,
          },
        })
      );
    }
  }

  console.log("Clientes criados.");

  // ===========================================================================
  // 8) VENDEDORES
  // ===========================================================================
  const vendedoresCriados: Record<string, any[]>= {};

  for (const empresa of empresas) {
    vendedoresCriados[empresa.id] = [];

    for (let i = 0; i < 5; i++) {
      vendedoresCriados[empresa.id].push(
        await prisma.vendedor.create({
          data: {
            nome: faker.person.fullName(),
            email: faker.internet.email() + uniq(),
            empresaId: empresa.id,
          },
        })
      );
    }
  }

  console.log("Vendedores criados.");

  // ===========================================================================
  // 9) LOTES (ESTOQUE REAL)
  // ===========================================================================
  for (const empresa of empresas) {
    for (const prod of produtosCriados[empresa.id]) {
      await prisma.lote.create({
        data: {
          produtoId: prod.id,
          fornecedorId: rand(fornecedoresCriados[empresa.id]).id,
          empresaId: empresa.id,
          precoCusto: money(),
          quantidadeAtual: qty(),
        },
      });
    }
  }

  console.log("Lotes criados.");

  // ===========================================================================
  // 10) VENDAS PROFISSIONAIS
  // ===========================================================================
  const vendasCriadas: Record<string, any[]>= {};

  for (const empresa of empresas) {
    vendasCriadas[empresa.id] = [];

    for (let i = 0; i < 50; i++) {
      vendasCriadas[empresa.id].push(
        await prisma.venda.create({
          data: {
            numero: faker.string.numeric(8),
            empresaId: empresa.id,
            clienteId: rand(clientesCriados[empresa.id]).id,
            vendedorId: rand(vendedoresCriados[empresa.id]).id,
            total: money(),
          },
        })
      );
    }
  }

  console.log("Vendas criadas.");

  // ===========================================================================
  // 11) ITENS DE VENDA
  // ===========================================================================
  for (const empresa of empresas) {
    for (const venda of vendasCriadas[empresa.id]) {
      const quantidadeItens = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < quantidadeItens; i++) {
        await prisma.itemVenda.create({
          data: {
            vendaId: venda.id,
            produtoId: rand(produtosCriados[empresa.id]).id,
            quantidade: faker.number.int({ min: 1, max: 5 }),
            precoUnitario: money(),
            empresaId: empresa.id,
          },
        });
      }
    }
  }

  console.log("Itens criados.");

  // ===========================================================================
  // 12) FINALIZADO
  // ===========================================================================

  console.log("🌱 SEED PROFISSIONAL FINALIZADO!");
}

main().finally(() => prisma.$disconnect());
