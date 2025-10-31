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
  Ampersand,
} from "lucide-react";

export const allMenuItems = [
  { key: "home", title: "Início", url: "/", icon: Home },
  {
    key: "estoque",
    title: "Dashboard de Estoque",
    url: "/estoque",
    icon: LayoutDashboard,
  },
  {
    key: "dashboard-sales",
    title: "Dashboard de Vendas",
    url: "/dashboard-sales",
    icon: BarChart3,
  },
  { key: "sales", title: "Registrar Venda", url: "/sales", icon: ShoppingCart },
  { key: "products", title: "Produtos", url: "/products", icon: Package },
  {
    key: "movements",
    title: "Movimentações",
    url: "/movements",
    icon: ArrowUpDown,
  },
  { key: "suppliers", title: "Fornecedores", url: "/suppliers", icon: Users },
  { key: "categories", title: "Categorias", url: "/categories", icon: Tag },
  {
    key: "tipos-servicos",
    title: "Tipos de Serviços",
    url: "/tipos-servicos",
    icon: Wrench,
  },
  {
    key: "service-categories",
    title: "Categorias de Serviço",
    url: "/service-categories",
    icon: Layers,
  },
  { key: "clientes", title: "Clientes", url: "/clientes", icon: Users },
  { key: "vendedores", title: "Vendedores", url: "/vendedores", icon: Users },
  { key: "settings", title: "Configurações", url: "/settings", icon: Settings },
  { key: "super_admin", title: "Admin", url: "/super-admin", icon: Ampersand }
];