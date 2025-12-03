import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function ModalDetalhesEmpresa({ empresa, open, onClose }: any) {
  if (!empresa) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Empresa</DialogTitle>
          <DialogDescription>
            Informações completas da empresa cadastrada.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <p><strong>Nome Fantasia:</strong> {empresa.nome_fantasia}</p>
          <p><strong>Razão Social:</strong> {empresa.razao_social}</p>
          <p><strong>CNPJ:</strong> {empresa.cnpj}</p>
          <p><strong>Email:</strong> {empresa.email}</p>
          <p><strong>Telefone:</strong> {empresa.telefone}</p>
          <p><strong>CEP:</strong> {empresa.cep}</p>
          <p><strong>Cidade:</strong> {empresa.cidade}</p>
          <p><strong>Estado:</strong> {empresa.estado}</p>
          <p><strong>Endereço:</strong> {empresa.endereco}</p>
          <p><strong>Número:</strong> {empresa.numero}</p>
          <p><strong>Bairro:</strong> {empresa.bairro}</p>
          {empresa.complemento && (
            <p><strong>Complemento:</strong> {empresa.complemento}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
