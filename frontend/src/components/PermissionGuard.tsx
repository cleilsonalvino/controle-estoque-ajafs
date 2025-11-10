import { useAuth } from "@/contexts/useAuth";
import { Navigate, Outlet } from "react-router-dom";

interface PermissionGuardProps {
  permissionKey: string;
  children: React.ReactNode;
}

export const PermissionGuard = ({ permissionKey, children }: PermissionGuardProps) => {
  const { user, isLoading } = useAuth();

  // Enquanto carrega
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // 🔒 Se não estiver logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const email = user.user.email?.toLowerCase();

  // 🌟 Acesso exclusivo para o super-admin master
  if (permissionKey === "super-admin") {
    if (email === "ajafs@admin.com") {
      return children ? <>{children}</> : <Outlet />;
    } else {
      console.warn(`🚫 Acesso restrito à conta master (${email})`);
      return <Navigate to="/" replace />;
    }
  }

  // 🔑 Verificação de permissão normal
  const hasPermission =
    user.user.telasPermitidas?.includes(permissionKey) ||
    user.user.telasPermitidas?.includes(`/${permissionKey}`) ||
    user.user.telasPermitidas?.includes("ADMINISTRADOR") ||
    user.user.papel === "ADMINISTRADOR";

  // 🚫 Sem permissão → redireciona pra home
  if (!hasPermission) {
    console.warn(`🚫 Acesso negado: ${permissionKey}`);
    return <Navigate to="/" replace />;
  }

  // ✅ Tem permissão → renderiza conteúdo normalmente
  return children ? <>{children}</> : <Outlet />;
};
