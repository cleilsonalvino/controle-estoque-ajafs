import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Plus, Edit, Trash } from "lucide-react";
import { motion } from "framer-motion";

export default function SuperAdminEmpresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "", telefone: "" });
  const [loading, setLoading] = useState(false);

  const fetchEmpresas = async () => {
    const { data } = await api.get("/empresa");
    setEmpresas(data);
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/empresa", form);
      await fetchEmpresas();
      setForm({ nome: "", cnpj: "", email: "", telefone: "" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta empresa?")) return;
    await api.delete(`/empresa/${id}`);
    fetchEmpresas();
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Painel de Super Admin</h1>
        <p className="text-muted-foreground">Gerencie empresas do sistema</p>
      </motion.div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Cadastrar nova empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nome da empresa"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <Input
              placeholder="CNPJ"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Telefone"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
            <Button type="submit" disabled={loading} className="col-span-2">
              {loading ? "Salvando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Empresas cadastradas</h2>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
          {empresas.map((empresa, i) => (
            <motion.div
              key={empresa.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4 flex flex-col justify-between h-full">
                <div>
                  <CardTitle className="text-lg font-semibold mb-2">
                    {empresa.nome}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">
                    {empresa.cnpj}
                  </p>
                  <p className="text-sm">{empresa.email}</p>
                  <p className="text-sm">{empresa.telefone}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Criada em {new Date(empresa.criadoEm).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(empresa.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
