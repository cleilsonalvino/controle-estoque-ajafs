import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};