// salvar como populate.js e rodar com `node populate.js`


const BASE_URL = "http://localhost:3000/api";

// Categorias genéricas
const categorias = [
  "Óleos",
  "Lubrificantes",
  "Filtros",
  "Freios",
  "Iluminação",
  "Baterias",
  "Pneus",
  "Suspensão",
  "Aditivos",
  "Sensores",
];

// Fornecedores de exemplo
const fornecedores = ["Fornecedor A", "Fornecedor B", "Fornecedor C", "Fornecedor D"];

// Produtos de exemplo (50 produtos)
const produtos = Array.from({ length: 50 }, (_, i) => ({
  nome: `Produto ${i + 1}`,
  descricao: `Descrição do produto ${i + 1}`,
  preco: (Math.random() * 500).toFixed(2),
  estoqueAtual: Math.floor(Math.random() * 100),
  estoqueMinimo: Math.floor(Math.random() * 10),
  categoria: categorias[i % categorias.length],
  fornecedor: fornecedores[i % fornecedores.length],
}));

async function criarCategorias() {
  const mapaCategorias = {};
  for (const nome of categorias) {
    const res = await fetch(`${BASE_URL}/categorias/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, descricao: null }),
    });
    const data = await res.json();
    console.log("Categoria criada:", data.nome, data.id);
    mapaCategorias[nome] = data.id;
  }
  return mapaCategorias;
}

async function criarFornecedores() {
  const mapaFornecedores = {};
  for (const nome of fornecedores) {
    const res = await fetch(`${BASE_URL}/fornecedores/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        localizacao: null,
        contato: null,
        email: null,
        telefone: null,
      }),
    });
    const data = await res.json();
    console.log("Fornecedor criado:", data.nome, data.id);
    mapaFornecedores[nome] = data.id;
  }
  return mapaFornecedores;
}

async function criarProdutos(categoriasMap, fornecedoresMap) {
  for (const produto of produtos) {
    const body = {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: Number(produto.preco),         // garantir number
      estoqueAtual: Number(produto.estoqueAtual),
      estoqueMinimo: Number(produto.estoqueMinimo),
      categoriaId: categoriasMap[produto.categoria],
      fornecedorId: fornecedoresMap[produto.fornecedor],
    };

    const res = await fetch(`${BASE_URL}/produtos/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Verifica se retornou 200
    if (!res.ok) {
      console.error("Erro ao criar produto:", produto.nome, await res.text());
      continue;
    }

    const data = await res.json();
    console.log("Produto criado:", data.nome || body.nome, data.id || "ID não retornado");
  }
}


async function popularBanco() {
  try {
    console.log("Criando categorias...");
    const categoriasMap = await criarCategorias();
    console.log("Criando fornecedores...");
    const fornecedoresMap = await criarFornecedores();
    console.log("Criando produtos...");
    await criarProdutos(categoriasMap, fornecedoresMap);
    console.log("Banco populado com sucesso!");
  } catch (err) {
    console.error("Erro ao popular banco:", err);
  }
}

popularBanco();
