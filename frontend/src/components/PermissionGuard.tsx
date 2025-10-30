import { useAuth } from "@/contexts/useAuth";
import { Navigate, Outlet } from "react-router-dom";

interface PermissionGuardProps {
  permissionKey: string;
  children: React.ReactNode;
}

export const PermissionGuard = ({ permissionKey, children }: PermissionGuardProps) => {
  const { user, isLoading } = useAuth();

  // Enquanto carrega, mostra o spinner
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não estiver logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔑 Compatibilidade com os dois formatos de permissão
  // (ex: "products" ou "/products")
  const hasPermission =
    user.telasPermitidas?.includes(permissionKey) ||
    user.telasPermitidas?.includes(`/${permissionKey}`) ||
    user.telasPermitidas?.includes("admin") ||
    user.papel === "ADMIN";

  // 🚫 Sem permissão → redireciona pra home
  if (!hasPermission) {
    console.warn(`🚫 Acesso negado: ${permissionKey}`);
    return <Navigate to="/" replace />;
  }

  // ✅ Tem permissão → renderiza conteúdo normalmente
  return children ? <>{children}</> : <Outlet />;
};
