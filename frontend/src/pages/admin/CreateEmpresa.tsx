import React, { useState, useEffect } from "react";
import { useEmpresa } from "@/contexts/EmpresaContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import axios from "axios";
import { Pencil, Trash2, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { ModalUsuarioCriado } from "@/components/empresa/ModalUsuarioCriado";
import { ModalDetalhesEmpresa } from "@/components/empresa/ModalDetalhesEmpresa";
import { ModalEditarEmpresa } from "@/components/empresa/ModalEditarEmpresa";

const API_KEY = "C32pTxFiquMWrAoEIzg27IRufNSGDZqu";
const API_URL = "https://api.invertexto.com/v1/cnpj/";

export default function CreateEmpresaPage() {
  const { createEmpresa, fetchEmpresas, empresas, loading } = useEmpresa();

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);

  const [createdUser, setCreatedUser] = useState<any>(null);

  const [form, setForm] = useState({
    nome_fantasia: "",
    cnpj: "",
    telefone: "",
    email: "",
    razao_social: "",
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

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ===========================================================
  // 🔎 BUSCAR DADOS DO CNPJ
  // ===========================================================
  const buscarCNPJ = async () => {
    if (!form.cnpj || form.cnpj.length < 14)
      return toast.error("Informe um CNPJ válido");

    try {
      toast.info("Consultando CNPJ...");

      const { data } = await axios.get(
        `${API_URL}${form.cnpj}?token=${API_KEY}`
      );

      handleChange("razao_social", data.razao_social || "");
      handleChange("nome_fantasia", data.nome_fantasia || "");
      handleChange("email", data.email || "");
      handleChange("telefone", data.telefone1 || "");
      handleChange("cep", data.endereco.cep || "");
      handleChange("estado", data.endereco.uf || "");
      handleChange("cidade", data.endereco.municipio || "");
      handleChange("endereco", data.endereco.logradouro || "");
      handleChange("numero", data.endereco.numero || "");
      handleChange("bairro", data.endereco.bairro || "");
      handleChange("complemento", data.endereco.complemento || "");

      toast.success("Dados do CNPJ carregados!");
    } catch (error) {
      toast.error("Falha ao consultar CNPJ.");
    }
  };

  // ===========================================================
  // 📌 ENVIAR FORMULÁRIO
  // ===========================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      logoEmpresa: logoFile || undefined,
    };

    const response = await createEmpresa(payload as any);

    if (response?.usuario) {
      setCreatedUser(response.usuario);
      setModalUsuarioOpen(true);
    } else {
      toast.error("Usuário não criado ou retornado pela API.");
    }

    fetchEmpresas();
  };

  // ===========================================================
  // ❌ EXCLUIR EMPRESA
  // (Você precisa ter no backend DELETE /empresa/:id)
  // ===========================================================
  const deleteEmpresa = async (id: string) => {
    try {
      await api.delete(`/empresa/${id}`);
      toast.success("Empresa excluída!");
      fetchEmpresas();
    } catch (error) {
      toast.error("Erro ao excluir empresa.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 space-y-10">
      {/* ===================================================== */}
      {/*       FORMULÁRIO DE CADASTRO DE EMPRESA               */}
      {/* ===================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar nova empresa</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Linha do CNPJ */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>CNPJ</Label>
                <Input
                  value={form.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  placeholder="Digite o CNPJ"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={buscarCNPJ} className="w-full">
                  Buscar CNPJ
                </Button>
              </div>
            </div>

            {/* Dados automáticos */}
            <div>
              <Label>Razão Social</Label>
              <Input
                value={form.razao_social}
                onChange={(e) => handleChange("razaoSocial", e.target.value)}
              />
            </div>

            <div>
              <Label>Nome Fantasia</Label>
              <Input
                value={form.nome_fantasia}
                onChange={(e) => handleChange("nomeFantasia", e.target.value)}
              />
            </div>

            {/* Contatos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={form.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CEP</Label>
                <Input
                  value={form.cep}
                  onChange={(e) => handleChange("cep", e.target.value)}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Input
                  value={form.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>Endereço</Label>
                <Input
                  value={form.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                />
              </div>
              <div>
                <Label>Número</Label>
                <Input
                  value={form.numero}
                  onChange={(e) => handleChange("numero", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bairro</Label>
                <Input
                  value={form.bairro}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                />
              </div>
              <div>
                <Label>Complemento</Label>
                <Input
                  value={form.complemento}
                  onChange={(e) => handleChange("complemento", e.target.value)}
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <Label>Logo da Empresa</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Botão submit */}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Cadastrar Empresa"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/*         ALERTA SOBRE USUÁRIO CRIADO                   */}
      {/* ===================================================== */}
      {createdUser && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>Usuário criado automaticamente</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Email:</strong> {createdUser.email}
            </p>
            <p>
              <strong>Papel:</strong> {createdUser.papel}
            </p>
            {createdUser.senha && (
              <p>
                <strong>Senha provisória:</strong> {createdUser.senha}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ===================================================== */}
      {/*                    TABELA CRUD                        */}
      {/* ===================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas cadastradas</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {empresas.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.nome_fantasia || ""}</TableCell>
                  <TableCell>{emp.cnpj}</TableCell>
                  <TableCell>{emp.cidade}</TableCell>

                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEmpresaSelecionada(emp);
                        setModalDetalhesOpen(true);
                      }}
                    >
                      <Eye size={18} />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEmpresaSelecionada(emp);
                        setModalEditarOpen(true);
                      }}
                    >
                      <Pencil size={18} />
                    </Button>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteEmpresa(emp.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ModalUsuarioCriado
        user={createdUser}
        open={modalUsuarioOpen}
        onClose={() => setModalUsuarioOpen(false)}
      />

      <ModalDetalhesEmpresa
        empresa={empresaSelecionada}
        open={modalDetalhesOpen}
        onClose={() => setModalDetalhesOpen(false)}
      />

      <ModalEditarEmpresa
        empresa={empresaSelecionada}
        open={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
      />
    </div>
  );
}
