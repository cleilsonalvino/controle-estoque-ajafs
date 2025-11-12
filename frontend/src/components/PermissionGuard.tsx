import { useAuth } from "@/contexts/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

interface PermissionGuardProps {
  permissionKey: string;
  children?: React.ReactNode;
}

export const PermissionGuard = ({ permissionKey, children }: PermissionGuardProps) => {
  const { user, isLoading } = useAuth();

  // Enquanto o login ainda carrega
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

  const email = user.email?.toLowerCase();
  const papel = user.papel?.toUpperCase();

  // 🌟 Acesso exclusivo da conta master (super-admin master)
  if (permissionKey === "super-admin") {
    // Caso 1: SUPER_ADMIN comum → acesso permitido à tela "super-admin"
    if (papel === "SUPER_ADMIN") {
      return children ? <>{children}</> : <Outlet />;
    }

    // Caso 2: conta master (e-mail fixo)
    if (email === "ajafs@admin.com") {
      return children ? <>{children}</> : <Outlet />;
    }

    // Caso contrário, bloqueia
    console.warn(`🚫 Acesso restrito ao SUPER_ADMIN (${email})`);
    return <Navigate to="/" replace />;
  }

  // 🚫 SUPER_ADMIN tentando acessar outras telas → bloqueia tudo
  if (papel === "SUPER_ADMIN" && permissionKey !== "super-admin") {
    console.warn(`🚫 SUPER_ADMIN não pode acessar ${permissionKey}`);
    return <Navigate to="/super-admin" replace />;
  }

  // 🔑 Verificação de permissão normal para usuários comuns
  const hasPermission =
    user.telasPermitidas?.includes(permissionKey) ||
    user.telasPermitidas?.includes(`/${permissionKey}`) ||
    user.telasPermitidas?.includes("ADMINISTRADOR") ||
    user.papel === "ADMINISTRADOR";

  // 🚫 Sem permissão → redireciona pra home
  if (!hasPermission) {
    console.warn(`🚫 Acesso negado: ${permissionKey}`);
    toast.error(`Você não tem permissão para acessar ${permissionKey}`);
    return <Navigate to="/" replace />;
  }

  // ✅ Tem permissão → renderiza conteúdo normalmente
  return children ? <>{children}</> : <Outlet />;
};
