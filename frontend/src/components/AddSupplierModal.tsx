import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSuppliers } from '../contexts/SupplierContext';
import { toast } from 'sonner';

// 🐛 CORREÇÃO 1: Adicionar o callback na interface de props
interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierCreated: () => void; // <--- NOVO CALLBACK ADICIONADO
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, onSupplierCreated }) => { // 🐛 CORREÇÃO 2: Desestruturar o callback
  const { createSupplier } = useSuppliers();
  const [newSupplier, setNewSupplier] = useState({
    nome: '',
    contato: '',
    email: '',
    telefone: '',
    endereco: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewSupplier(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!newSupplier.nome || !newSupplier.endereco) { // Adicionando endereço como obrigatório, conforme o seu código
      toast.error('Por favor, preencha o Nome e o Endereço do fornecedor.');
      return;
    }

    setIsSaving(true);
    try {
      // Assumindo que createSupplier faz a chamada à API
      await createSupplier({
        nome: newSupplier.nome,
        contato: newSupplier.contato,
        email: newSupplier.email || null,
        telefone: newSupplier.telefone,
        endereco: newSupplier.endereco,
      });
        
      toast.success("Fornecedor criado com sucesso!");
        
      // 🐛 CORREÇÃO 3: Chamar o callback para recarregar a lista no componente pai
      onSupplierCreated(); 
        
      setNewSupplier({
        nome: '',
        contato: '',
        email: '',
        telefone: '',
        endereco: '',
      });
      onClose();
    } catch (error) {
        toast.error("Falha ao salvar fornecedor.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Fornecedor</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome*</Label>
            <Input id="nome" value={newSupplier.nome} onChange={handleChange} className='border-gray-500'/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contato">Contato</Label>
            <Input className='border-gray-500' id="contato" value={newSupplier.contato} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input className='border-gray-500' id="email" type="email" value={newSupplier.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input className='border-gray-500' id="telefone" value={newSupplier.telefone} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço*</Label>
            <Input className='border-gray-500' id="endereco" value={newSupplier.endereco} onChange={handleChange} />
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