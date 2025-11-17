import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/useAuth";
import { allMenuItems } from "@/config/menuItems";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { LogOut } from "lucide-react";

export const AppSidebar = () => {
  const { user, isLoading, logout } = useAuth(); // <= logout adicionado
  const location = useLocation();
  const email = user?.email?.toLowerCase();

  const visibleMenuItems = useMemo(() => {
    if (isLoading || !user) return [];
    const isAdmin = user.papel?.toLowerCase() === "administrador";
    const isMaster = email === "ajafs@admin.com";

    if (isMaster) return allMenuItems;
    if (isAdmin)
      return allMenuItems.filter((item) => item.key !== "super_admin");
    if (!user.telasPermitidas) return [];

    return allMenuItems.filter(
      (item) =>
        user.telasPermitidas.includes(item.url) && item.key !== "super_admin"
    );
  }, [user, isLoading, email]);

  const groupedMenu = useMemo(() => {
    const grupos: Record<string, typeof allMenuItems> = {
      Gestão: [],
      Cadastros: [],
      Financeiro: [],
      Serviços: [],
      Relatórios: [],
      Outros: [],
    };

    const userPapel = user?.papel?.toLowerCase();
    const isFinanceiroAuthorized =
      userPapel === "administrador" ||
      user?.email?.toLowerCase() === "ajafs@admin.com";

    visibleMenuItems.forEach((item) => {
      if (item.key.startsWith("financeiro-")) {
        if (isFinanceiroAuthorized) {
          grupos["Financeiro"].push(item);
        }
      } else if (
        ["home", "estoque", "dashboard-sales", "sales", "pos-venda"].includes(
          item.key
        )
      ) {
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
  }, [visibleMenuItems, user]);

  return (
    <Sidebar className="bg-slate-400">
      <SidebarHeader>
        <div
          className="p-2 w-28 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        >
          <img src="/logo-ajafs.png" alt="logo ajafs+ sistemas" />
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarMenu>
          {Object.entries(groupedMenu).map(([categoria, itens]) =>
            itens.length > 0 ? (
              <SidebarGroup key={categoria}>
                <SidebarGroupLabel>{categoria}</SidebarGroupLabel>
                <SidebarGroupContent>
                  {itens.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <NavLink to={item.url} className="w-full">
                        {({ isActive }) => (
                          <SidebarMenuButton
                            isActive={isActive}
                            className={cn(
                              "flex items-center space-x-2 px-2 py-1 rounded-md transition"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
            ) : null
          )}

          {/* ==================== */}
          {/* ⭐ BOTÃO DE SAIR ⭐ */}
          {/* ==================== */}

          <Separator className="my-2" />

          <SidebarMenuItem>
            <button
              onClick={logout}
              className={cn(
                "w-full flex items-center space-x-2 px-2 py-1 rounded-md transition hover:bg-red-100 hover:text-red-600"
              )}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
