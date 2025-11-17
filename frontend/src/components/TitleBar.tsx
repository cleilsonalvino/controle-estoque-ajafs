import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { LogOut, ShoppingCart } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const TitleBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>

      </div>
    </header>
  );
};