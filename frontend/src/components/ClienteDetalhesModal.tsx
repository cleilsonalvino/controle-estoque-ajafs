
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Cliente } from '../contexts/ClienteContext';

interface ClienteDetalhesModalProps {
  cliente: Cliente;
  children: React.ReactNode;
}

const ClienteDetalhesModal: React.FC<ClienteDetalhesModalProps> = ({ cliente, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong>Nome:</strong> {cliente.nome}
          </div>
          <div>
            <strong>CPF:</strong> {cliente.cpf || 'N/A'}
          </div>
          <div>
            <strong>Email:</strong> {cliente.email || 'N/A'}
          </div>
          <div>
            <strong>Telefone:</strong> {cliente.telefone || 'N/A'}
          </div>
          <div>
            <strong>Endereço:</strong> {cliente.endereco || 'N/A'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteDetalhesModal;
