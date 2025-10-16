import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ArrowUpDown,
  Users,
  Tag,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/useAuth";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Dashboard de Vendas", url: "/dashboard-sales", icon: BarChart3 },
  { title: "Registrar Venda", url: "/sales", icon: ShoppingCart },
  { title: "Produtos", url: "/products", icon: Package },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Movimentações", url: "/movements", icon: ArrowUpDown },
  { title: "Fornecedores", url: "/suppliers", icon: Users },
  { title: "Categorias", url: "/categories", icon: Tag },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Vendedores", url: "/vendedores", icon: Users },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <div
      className={cn(
        "bg-card border-r shadow-sm transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Sistema</h2>
                <p className="text-xs text-muted-foreground">Estoque</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const active = isActive(item.url);
            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start"
        >
          <LogOut className="h-5 w-5 mr-3" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};
