import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

export const ProtectedRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ⏳ Ainda carregando o usuário do token
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // 🔒 Após carregar, mas não está autenticado
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // 🔓 OK, renderiza normalmente
  return <Outlet />;
};
