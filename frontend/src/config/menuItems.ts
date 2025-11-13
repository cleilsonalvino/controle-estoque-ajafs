import {
  LayoutDashboard,
  Package,
  BarChart3,
  ArrowUpDown,
  Users,
  Tag,
  ShoppingCart,
  Settings,
  Wrench,
  Layers,
  Home,
  Landmark,
} from "lucide-react";

export const allMenuItems = [
  {
    key: "home",
    title: "Início",
    url: "/",
    icon: Home,
    description: "Página inicial do sistema. Acesso obrigatório.", // Adicionado
  },
  {
    key: "estoque",
    title: "Estoque",
    url: "/estoque",
    icon: LayoutDashboard,
    description:
      "Visão geral e acompanhamento do status do inventário e estoque.", // Adicionado
  },
  {
    key: "dashboard-sales",
    title: "Dashboard de Vendas",
    url: "/dashboard-sales",
    icon: BarChart3,
    description: "Análise de métricas, gráficos e desempenho de vendas.", // Adicionado
  },
  {
    key: "pos-venda",
    title: "Pós Venda",
    url: "/pos-venda",
    icon: BarChart3,
    description: "Gerenciamento e acompanhamento de atividades pós-venda.", // Adicionado
  },
  {
    key: "sales",
    title: "PDV e Prestação de Serviços",
    url: "/sales",
    icon: ShoppingCart,
    description:
      "Permite iniciar e finalizar novas transações de serviços e acesso ao PDV.", // Adicionado
  },
  {
    key: "products",
    title: "Gestão de produtos",
    url: "/products",
    icon: Package,
    description: "Cadastra, edita e gerencia o catálogo completo de produtos.", // Adicionado
  },
  {
    key: "categories",
    title: "Categorias de produtos",
    url: "/categories",
    icon: Tag,
    description: "Configura e organiza as categorias para produtos.", // Adicionado
  },
  {
    key: "movements",
    title: "Movimentações de Estoque",
    url: "/movements",
    icon: ArrowUpDown,
    description:
      "Registra entradas e saídas manuais do estoque (ajustes, perdas, etc.).", // Adicionado
  },
  {
    key: "suppliers",
    title: "Fornecedores",
    url: "/suppliers",
    icon: Users,
    description: "Cadastra e gerencia informações de todos os fornecedores.", // Adicionado
  },

  {
    key: "tipos-servicos",
    title: "Tipos de Serviços",
    url: "/tipos-servicos",
    icon: Wrench,
    description: "Gerencia a lista de serviços oferecidos pela empresa.", // Adicionado
  },
  {
    key: "service-categories",
    title: "Categorias de Serviço",
    url: "/service-categories",
    icon: Layers,
    description: "Configura e organiza as categorias para serviços.", // Adicionado
  },
  {
    key: "clientes",
    title: "Clientes",
    url: "/clientes",
    icon: Users,
    description: "Cadastra, edita e gerencia informações dos clientes.", // Adicionado
  },
  {
    key: "vendedores",
    title: "Vendedores",
    url: "/vendedores",
    icon: Users,
    description: "Gerencia o cadastro e informações dos vendedores.", // Adicionado
  },
  // Financeiro
  {
    key: "financeiro-dashboard",
    title: "Dashboard Financeiro",
    url: "/financeiro",
    icon: Landmark,
    description:
      "Visão geral e indicadores chave da saúde financeira da empresa.", // Adicionado
  },
  {
    key: "financeiro-movimentacoes",
    title: "Movimentações Financeiras",
    url: "/financeiro/movimentacoes",
    icon: ArrowUpDown,
    description:
      "Lançamento e consulta de todas as entradas e saídas de caixa.", // Adicionado
  },
  {
    key: "financeiro-contas-pagar",
    title: "Contas a Pagar",
    url: "/financeiro/contas-a-pagar",
    icon: BarChart3,
    description: "Gerencia e liquida as contas de despesas e obrigações.", // Adicionado
  },
  {
    key: "financeiro-contas-receber",
    title: "Contas a Receber",
    url: "/financeiro/contas-a-receber",
    icon: BarChart3,
    description:
      "Gerencia e registra o recebimento de receitas e vendas a prazo.", // Adicionado
  },
  {
    key: "financeiro-contas-bancarias",
    title: "Contas Bancárias",
    url: "/financeiro/contas-bancarias",
    icon: Landmark,
    description:
      "Cadastro e gestão de contas correntes e saldos iniciais/atuais.", // Adicionado
  },
  {
    key: "financeiro-categorias",
    title: "Categorias Financeiras",
    url: "/financeiro/categorias",
    icon: Tag,
    description: "Cria e organiza categorias para receitas e despesas.", // Adicionado
  },
  {
    key: "financeiro-relatorios",
    title: "Relatórios Financeiros",
    url: "/financeiro/relatorios",
    icon: BarChart3,
    description: "Acesso a relatórios detalhados como fluxo de caixa e DRE.", // Adicionado
  },
  {
    key: "settings",
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    description: "Ajustes gerais do sistema, empresa e dados de acesso.", // Adicionado
  },
];
