import { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/useAuth";
import { Package, ChevronDown, LogOut, Menu, ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { allMenuItems } from "@/config/menuItems";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isMobile = useIsMobile();
  const email = user?.email?.toLowerCase();

  // 🔹 Itens visíveis considerando permissões e papel
  const visibleMenuItems = useMemo(() => {
    if (isLoading || !user) return [];

    const isAdmin = user.papel?.toLowerCase() === "administrador";
    const isMaster = email === "ajafs@admin.com";

    // 🔸 Se for o master, mostra tudo (incluindo super_admin)
    if (isMaster) return allMenuItems;

    // 🔸 Se for admin, mostra tudo exceto o super_admin
    if (isAdmin)
      return allMenuItems.filter((item) => item.key !== "super_admin");

    // 🔸 Para usuários comuns, mostra apenas as telas permitidas e oculta o super_admin
    if (!user.telasPermitidas) return [];

    return allMenuItems.filter(
      (item) =>
        user.telasPermitidas.includes(item.url) && item.key !== "super_admin"
    );
  }, [user, isLoading, email]);

  // 🔹 Agrupamento dinâmico (usando os itens visíveis)
  const groupedMenu = useMemo(() => {
    const grupos: Record<string, typeof allMenuItems> = {
      Gestão: [],
      Cadastros: [],
      Serviços: [],
      Relatórios: [],
      Outros: [],
    };

    visibleMenuItems.forEach((item) => {
      if (["home", "estoque", "dashboard-sales", "sales"].includes(item.key)) {
        grupos["Gestão"].push(item);
      } else if (
        [
          "products",
          "movements",
          "suppliers",
          "categories",
          "clientes",
          "vendedores",
        ].includes(item.key)
      ) {
        grupos["Cadastros"].push(item);
      } else if (["tipos-servicos", "service-categories"].includes(item.key)) {
        grupos["Serviços"].push(item);
      } else if (["settings", "super_admin"].includes(item.key)) {
        grupos["Outros"].push(item);
      } else {
        grupos["Relatórios"].push(item);
      }
    });

    return grupos;
  }, [visibleMenuItems]);

  // 🔹 Bloqueio de scroll quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = isMobile && mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  // 🔹 Renderização
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div
            className="p-2 w-28 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <img src="/logo-ajafs.png" alt="logo ajafs+ sistemas" />
          </div>
        </div>

        {/* Menu Desktop Agrupado */}
        <nav className="hidden md:flex items-center space-x-6">
          {Object.entries(groupedMenu).map(([categoria, itens]) =>
            itens.length > 0 ? (
              <DropdownMenu key={categoria}>
                <DropdownMenuTrigger className="flex items-center space-x-1 font-medium text-sm hover:text-primary transition">
                  <span>{categoria}</span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {itens.map((item) => (
                    <DropdownMenuItem asChild key={item.key}>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center space-x-2 px-2 py-1 rounded-md transition",
                          isActive(item.url)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null
          )}
        </nav>

        {/* Ações Direitas */}
        <div className="flex items-center space-x-3">
          {(user.papel === "ADMINISTRADOR" || user.papel === "USUARIO") && (
            <Button
              onClick={() => navigate("/sales")}
              variant="default"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Abrir PDV</span>
            </Button>
          )}

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden md:inline">Sair</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card overflow-y-auto max-h-[calc(100vh-4rem)]">
          {Object.entries(groupedMenu).map(([categoria, itens]) =>
            itens.length > 0 ? (
              <div key={categoria} className="p-3 border-b">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  {categoria}
                </p>
                <div className="flex flex-col space-y-1">
                  {itens.map((item) => (
                    <NavLink
                      key={item.key}
                      to={item.url}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm",
                        isActive(item.url)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : null
          )}

          <div className="p-3 border-t">
            <Button
              onClick={() => {
                setMobileOpen(false);
                navigate("/sales");
              }}
              className="w-full flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Abrir PDV</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
