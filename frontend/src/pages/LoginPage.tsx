import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setPassword] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  // ======================================================
  // ✅ Efeito global para redirecionar após login
  // ======================================================
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (userRole === "super_admin" || userRole === "SUPER_ADMIN") {
        navigate("/super-admin");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, isLoading, userRole, navigate]);

  // ======================================================
  // ✅ Envio do formulário
  // ======================================================
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const { success, user } = await login(email, senha);

    if (!success) {
      toast.error("Usuário ou senha inválidos!");
      return;
    }

    // ✅ Armazena papel para o redirecionamento via useEffect
    setUserRole(user);
    toast.success("Login realizado com sucesso!");

    // 🚀 Redirecionamento imediato (opcional)
    if (user === "super_admin" || user === "SUPER_ADMIN") {
      navigate("/super-admin");
    } else {
      navigate("/");
    }
  };

  // ======================================================
  // 🔹 Tela de carregamento
  // ======================================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Verificando sessão...
      </div>
    );
  }

  // ======================================================
  // 🔹 Layout
  // ======================================================
  return (
    <div className="min-h-screen flex">
      {/* LADO ESQUERDO */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-200 to-purple-100 items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center text-center px-10">
          <img
            src="/logo-ajafs.png"
            alt="Logo AJAFS"
            className="w-72 object-contain drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold leading-tight">
            Bem-vindo ao Sistema de Gestão
          </h1>
          <p className="text-white/90 mt-4 max-w-md">
            Organize suas vendas, controle seu estoque e acompanhe resultados em
            tempo real com o sistema da AJAFS.
          </p>
        </div>
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* LADO DIREITO */}
      <div className="flex-1 flex items-center justify-center bg-muted/30 p-6">
        <Card className="w-full max-w-sm shadow-lg border border-border/50 bg-white/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all"
              >
                Entrar
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              © {new Date().getFullYear()}{" "}
              <a href="https://www.ajafs.com.br" className="text-blue-500" target="_blank">
                AJAFS
              </a>{" "}
              - Todos os direitos reservados <br />
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
