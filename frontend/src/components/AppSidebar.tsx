import { useMemo } from "react";
import { NavLink } from "react-router-dom";
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
  const { user, isLoading, logout } = useAuth();
  const email = user?.email?.toLowerCase();

  // =====================================================
  // ITENS VISIVEIS POR PERMISSAO
  // =====================================================
  const visibleMenuItems = useMemo(() => {
    if (isLoading || !user) return [];

    // sem telasPermitidas, nao mostra nada
    if (!user.telasPermitidas || !Array.isArray(user.telasPermitidas)) {
      return [];
    }

    // somente urls presentes em telasPermitidas
    return allMenuItems.filter((item) =>
      user.telasPermitidas.includes(item.url)
    );
  }, [user, isLoading, email]);

  // =====================================================
  // AGRUPAMENTO DOS ITENS DO MENU
  // =====================================================
  const groupedMenu = useMemo(() => {
    const grupos: Record<string, typeof allMenuItems> = {
      Gestão: [],
      Cadastros: [],
      Financeiro: [],
      Serviços: [],
      Relatórios: [],
      Outros: [],
    };

    visibleMenuItems.forEach((item) => {
      // financeiro
      if (item.key.startsWith("financeiro-")) {
        grupos["Financeiro"].push(item);
        return;
      }

      // gestão
      if (
        [
          "home",
          "estoque",
          "dashboard-sales",
          "sales",
          "pos-venda",
          "ordens-de-servico",
        ].includes(item.key)
      ) {
        grupos["Gestão"].push(item);
        return;
      }

      // cadastros
      if (
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
        return;
      }

      // serviços
      if (["tipos-servicos", "service-categories"].includes(item.key)) {
        grupos["Serviços"].push(item);
        return;
      }

      // relatorios
      if (item.url.includes("/relatorios")) {
        grupos["Relatórios"].push(item);
        return;
      }

      // outros (settings, super admin, etc)
      grupos["Outros"].push(item);
    });

    return grupos;
  }, [visibleMenuItems]);

  // =====================================================
  // COMPONENTE
  // =====================================================
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
