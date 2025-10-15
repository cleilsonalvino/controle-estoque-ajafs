
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useVendedores, Vendedor } from "@/contexts/VendedorContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Vendedores = () => {
  const { vendedores, createVendedor, updateVendedor, deleteVendedor } = useVendedores();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);



  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Vendedores</h1>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendedores</CardTitle>
          <CardDescription>Gerencie seus vendedores.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>Adicionar Vendedor</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Vendedor</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta">Meta</Label>
                    <Input id="meta" type="number" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    const nome = (document.getElementById('nome') as HTMLInputElement).value;
                    const email = (document.getElementById('email') as HTMLInputElement).value;
                    const meta = (document.getElementById('meta') as HTMLInputElement).value;
                    createVendedor({ nome, email, meta: Number(meta) });
                    setIsCreateModalOpen(false);
                  }}>Salvar</Button>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendedores.map((vendedor) => (
                <TableRow key={vendedor.id}>
                  <TableCell>{vendedor.nome}</TableCell>
                  <TableCell>{vendedor.email}</TableCell>
                  <TableCell>{vendedor.meta}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedVendedor(vendedor); setIsEditModalOpen(true); }}>Editar</Button>
                    <Button variant="destructive" size="sm" className="ml-2" onClick={() => { setSelectedVendedor(vendedor); setIsDeleteModalOpen(true); }}>Excluir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vendedor</DialogTitle>
          </DialogHeader>
          {selectedVendedor && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome</Label>
                <Input id="edit-nome" defaultValue={selectedVendedor.nome} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" defaultValue={selectedVendedor.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-meta">Meta</Label>
                <Input id="edit-meta" type="number" defaultValue={selectedVendedor.meta} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => {
              if (selectedVendedor) {
                const nome = (document.getElementById('edit-nome') as HTMLInputElement).value;
                const email = (document.getElementById('edit-email') as HTMLInputElement).value;
                const meta = (document.getElementById('edit-meta') as HTMLInputElement).value;

                if(email === '' || nome === '' || meta === ''){
                  return alert('Preencha todos os campos');
                }

                updateVendedor(selectedVendedor.id, { nome, email, meta: Number(meta) });
                setIsEditModalOpen(false);
              }
            }}>Salvar</Button>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Vendedor</DialogTitle>
          </DialogHeader>
          {selectedVendedor && (
            <p>Você tem certeza que deseja excluir o vendedor {selectedVendedor.nome}?</p>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={() => {
              if (selectedVendedor) {
                deleteVendedor(selectedVendedor.id);
                setIsDeleteModalOpen(false);
              }
            }}>Excluir</Button>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendedores;
