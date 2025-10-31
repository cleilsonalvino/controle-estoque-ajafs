import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empresa, useEmpresa } from "@/contexts/EmpresaContext";
import { motion } from "framer-motion";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminEmpresas() {
  const { empresa, createEmpresa, updateEmpresa, fetchEmpresa, loading } = useEmpresa();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [form, setForm] = useState<Omit<Empresa, "id" | "criadoEm" | "atualizadoEm">>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    razaoSocial: "",
    nomeFantasia: "",
    inscEstadual: "",
    inscMunicipal: "",
    cnae: "",
    cep: "",
    estado: "",
    cidade: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
  });

  // 🔄 Atualiza lista de empresas ao montar
  useEffect(() => {
    fetchEmpresas();
  }, []);

  // 🔄 Busca todas as empresas (reutilizando contexto)
  const fetchEmpresas = async () => {
    try {
      await fetchEmpresa(); // já atualiza o estado interno
      // Caso queira listar várias empresas (não só a vinculada ao user),
      // você pode expandir o contexto depois com uma função fetchAllEmpresas()
    } catch (error) {
      toast.error("Erro ao carregar empresas");
      console.error(error);
    }
  };

  // 🏗️ Cadastrar nova empresa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createEmpresa(form as Omit<Empresa, "id">);
      if (created) {
        toast.success("Empresa criada com sucesso!");
        setEmpresas((prev) => [...prev, created]);
        resetForm();
      }
    } catch {
      toast.error("Erro ao criar empresa");
    }
  };

  const resetForm = () => {
    setForm({
      nome: "",
      cnpj: "",
      telefone: "",
      email: "",
      razaoSocial: "",
      nomeFantasia: "",
      inscEstadual: "",
      inscMunicipal: "",
      cnae: "",
      cep: "",
      estado: "",
      cidade: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
    });
  };

  // ✏️ Editar empresa (simples)
  const handleEdit = async (id: string) => {
    const novaRazao = prompt("Nova razão social:");
    if (!novaRazao) return;

    try {
      const updated = await updateEmpresa({ id, razaoSocial: novaRazao });
      if (updated) {
        toast.success("Empresa atualizada com sucesso!");
        fetchEmpresas();
      }
    } catch {
      toast.error("Erro ao atualizar empresa");
    }
  };

  // 🗑️ Deletar empresa (caso contexto tenha essa função futuramente)
  const handleDelete = (id: string) => {
    toast.info("Função de exclusão ainda não disponível via contexto");
  };

  return (
    <div className="container mx-auto p-6 space-y-10">
      {/* Cabeçalho */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Painel do Super Administrador</h1>
        <p className="text-muted-foreground">
          Cadastre e gerencie as empresas do sistema
        </p>
      </motion.div>

      {/* Formulário de cadastro */}
      <Card className="max-w-4xl shadow-md">
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
              placeholder="Telefone"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
            <Input
              placeholder="E-mail"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Razão Social"
              value={form.razaoSocial}
              onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
            />
            <Input
              placeholder="Nome Fantasia"
              value={form.nomeFantasia}
              onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
            />
            <Input
              placeholder="Cidade"
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            />
            <Input
              placeholder="Estado"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            />
            <Button
              type="submit"
              disabled={loading}
              className="col-span-2 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? "Salvando..." : "Cadastrar Empresa"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Listagem (usando empresa do contexto) */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Empresa atual</h2>
        {empresa ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-4 flex flex-col justify-between h-full max-w-lg">
              <div>
                <CardTitle className="text-lg font-semibold mb-1">
                  {empresa.nomeFantasia || empresa.nome}
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-1">
                  CNPJ: {empresa.cnpj}
                </p>
                <p className="text-sm">{empresa.email}</p>
                <p className="text-sm">{empresa.telefone}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {empresa.cidade} / {empresa.estado}
                </p>
              </div>

              <div className="flex gap-2 mt-3 justify-end">
                <Button size="sm" variant="outline" onClick={() => handleEdit(empresa.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(empresa.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <p className="text-muted-foreground">Nenhuma empresa cadastrada ainda.</p>
        )}
      </section>
    </div>
  );
}
