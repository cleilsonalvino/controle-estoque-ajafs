import { useState, useEffect, useMemo } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/useAuth";
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
  Wrench,
  Layers,
  Home,
} from "lucide-react";

import { allMenuItems } from "@/config/menuItems";

// Mova esta lista para 'src/config/menuItems.ts' para usar em Settings.tsx também

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout, user, isLoading } = useAuth(); // NOVO: Pegar o isLoading
  const navigate = useNavigate();

  const visibleMenuItems = useMemo(() => {
    if (isLoading || !user?.telasPermitidas) {
      return [];
    }

    console.log("🔑 Permissões:", user.telasPermitidas);

    if (user.papel === "ADMINISTRADOR" || user.telasPermitidas.includes("ADMINISTRADOR")) {
      return allMenuItems;
    }

    return allMenuItems.filter((item) =>
      user.telasPermitidas.includes(item.url)
    );
  }, [user, isLoading]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    const activePath = location.pathname;
    if (path === "/" && activePath === "/") return true;
    if (path !== "/" && activePath.startsWith(path)) return true;
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
                <h2 className="font-bold text-foreground">AJAFS</h2>
                <p className="text-xs text-muted-foreground">
                  Gestão empresarial
                </p>
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
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {/* ATUALIZADO: Mostra um 'esqueleto' simples enquanto carrega */}
          {isLoading && !collapsed && (
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-8 bg-muted rounded animate-pulse w-5/6" />
              <div className="h-8 bg-muted rounded animate-pulse w-4/6" />
            </div>
          )}

          {!isLoading &&
            visibleMenuItems.map((item) => {
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
      <div className="p-4 border-t mt-auto">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start"
        >
          <LogOut className="h-5 w-5 mr-3" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
};
