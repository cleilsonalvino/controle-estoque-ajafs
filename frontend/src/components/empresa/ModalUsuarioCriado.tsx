import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ModalUsuarioCriado({ user, open, onClose }: any) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Usuário criado com sucesso</DialogTitle>
          <DialogDescription>
            Envie estes dados ao responsável pela empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-3">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Papel:</strong> {user.papel}</p>
          {user.senha && (
            <p><strong>Senha provisória:</strong> {user.senha}</p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
