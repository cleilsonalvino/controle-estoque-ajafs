import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Movements from "./pages/Movements";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import ServiceCategories from "./pages/ServiceCategories";
import Settings from "./pages/Settings";
import Sales from "./pages/Sales";
import SalesDashboard from "./pages/SalesDashboard";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider } from "./contexts/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProdutoProvider } from "@/contexts/ProdutoContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { ServiceCategoryProvider } from "@/contexts/ServiceCategoryContext";
import { SupplierProvider } from "@/contexts/SupplierContext";
import { SalesProvider } from "./contexts/SalesContext";
import { ClienteProvider } from "./contexts/ClienteContext";
import { VendedorProvider } from "./contexts/VendedorContext";
import { TipoServicoProvider } from "./contexts/TiposServicosContext";
import { EmpresaProvider } from "./contexts/EmpresaContext";
import Clientes from "./pages/Clientes";
import Vendedores from "./pages/Vendedores";
import TiposServicos from "./pages/TiposServicos";
import { TitleBar } from "./components/TitleBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TitleBar/>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <EmpresaProvider>
            <SalesProvider>
              <SupplierProvider>
                <CategoryProvider>
                  <ServiceCategoryProvider>
                    <ProdutoProvider>
                      <ClienteProvider>
                        <VendedorProvider>
                          <TipoServicoProvider>
                            <Routes>
                              <Route path="/login" element={<LoginPage />} />

                              {/* Routes protected by authentication */}
                              <Route element={<ProtectedRoute />}>
                                
                                {/* === GROUP 1: Routes WITH Sidebar === */}
                                <Route path="/" element={<Layout />}>
                                  <Route index element={<Dashboard />} />
                                  <Route path="/products" element={<Products />}/>
                                  <Route path="/movements" element={<Movements />} />
                                  <Route path="/suppliers" element={<Suppliers />} />
                                  <Route path="/categories" element={<Categories />} />
                                  <Route path="/service-categories" element={<ServiceCategories />} />
                                  <Route path="/tipos-servicos" element={<TiposServicos />} />
                                  <Route path="/dashboard-sales" element={<SalesDashboard />} />
                                  <Route path="/clientes" element={<Clientes />} />
                                  <Route path="/vendedores" element={<Vendedores />} />
                                  <Route path="/settings" element={<Settings />} />
                                </Route>

                                {/* === GROUP 2: Route WITHOUT Sidebar (PDV) === */}
                                <Route path="/sales" element={<Sales />} />

                              </Route>

                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </TipoServicoProvider>
                        </VendedorProvider>
                      </ClienteProvider>
                    </ProdutoProvider>
                  </ServiceCategoryProvider>
                </CategoryProvider>
              </SupplierProvider>
            </SalesProvider>
          </EmpresaProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
