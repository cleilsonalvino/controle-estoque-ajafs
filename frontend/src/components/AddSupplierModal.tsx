
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSuppliers } from '../contexts/SupplierContext';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose }) => {
  const { createSupplier } = useSuppliers();
  const [newSupplier, setNewSupplier] = useState({
    nome: '',
    contato: '',
    email: '',
    telefone: '',
    endereco: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewSupplier(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!newSupplier.nome || !newSupplier.contato || !newSupplier.telefone || !newSupplier.endereco) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome, Contato, Telefone, Endereço).');
      return;
    }

    await createSupplier({
      nome: newSupplier.nome,
      contato: newSupplier.contato,
      email: newSupplier.email || null,
      telefone: newSupplier.telefone,
      endereco: newSupplier.endereco,
      criadoEm: new Date(), // These will be ignored by Omit<Supplier, "id"> but are good for type safety
      atualizadoEm: new Date(), // Same as above
    });
    setNewSupplier({
      nome: '',
      contato: '',
      email: '',
      telefone: '',
      endereco: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar \zx</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome*</Label>
            <Input id="nome" value={newSupplier.nome} onChange={handleChange} className='border-gray-500'/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contato">Contato*</Label>
            <Input id="contato" value={newSupplier.contato} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={newSupplier.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone*</Label>
            <Input id="telefone" value={newSupplier.telefone} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço*</Label>
            <Input id="endereco" value={newSupplier.endereco} onChange={handleChange} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Fornecedor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplierModal;
