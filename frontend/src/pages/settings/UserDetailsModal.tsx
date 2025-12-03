import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const UserDetailsModal = ({
  open,
  onClose,
  user,
  groupedPermissions,
}) => {
  if (!user) return null;

  // Avatar
  const fotoUrl = user.urlImagem
    ? `${import.meta.env.VITE_API_URL}/${user.urlImagem}`
    : null;

  // Gera uma lista formatada das telas
  const permissoesAgrupadas = groupedPermissions.map(([categoria, itens]) => {
    const permitidos = itens.filter((i) =>
      user.telasPermitidas?.includes(i.url)
    );
    return permitidos.length > 0
      ? { categoria, itens: permitidos }
      : null;
  }).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes do Usuário
          </DialogTitle>
          <DialogDescription>
            Informações completas do usuário selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* CABEÇALHO COM FOTO */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {fotoUrl ? (
                <AvatarImage src={fotoUrl} alt={user.nome} />
              ) : (
                <AvatarFallback>
                  {user.nome?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div>
              <p className="text-lg font-semibold">{user.nome}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm font-medium mt-1">
                Papel:{" "}
                <span className="text-blue-600">{user.papel}</span>
              </p>
            </div>
          </div>

          <Separator />

          {/* PERMISSÕES */}
          <div>
            <h4 className="font-semibold mb-2">Telas Permitidas</h4>

            {permissoesAgrupadas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma permissão atribuída.
              </p>
            ) : (
              <div className="space-y-4">
                {permissoesAgrupadas.map((grupo) => (
                  <div key={grupo.categoria}>
                    <p className="font-medium text-sm">{grupo.categoria}</p>

                    <ul className="ml-4 list-disc text-sm mt-1">
                      {grupo.itens.map((i) => (
                        <li key={i.url}>{i.title}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
