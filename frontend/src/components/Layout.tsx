import { Outlet } from "react-router-dom";
import { AppNavbar } from "@/components/AppSidebar"; // (que agora é a barra superior)

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar fixa no topo */}
      <AppNavbar />

      {/* Conteúdo principal (com padding-top para não ficar atrás da navbar) */}
      <main className="flex-1 overflow-auto pt-20 px-4">
        <Outlet />
      </main>
    </div>
  );
};
