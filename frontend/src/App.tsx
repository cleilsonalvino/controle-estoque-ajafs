import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Movements from "./pages/Movements";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider } from "./contexts/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProdutoProvider } from "@/contexts/ProdutoContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { SupplierProvider } from "@/contexts/SupplierContext";
import { SalesProvider } from "./contexts/SalesContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SalesProvider>
            <SupplierProvider>
              <CategoryProvider>
                <ProdutoProvider>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/movements" element={<Movements />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/sales" element={<Sales />} />
                      </Route>
                    </Route>
                    {/* Catch-all route for 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProdutoProvider>
              </CategoryProvider>
            </SupplierProvider>
          </SalesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
