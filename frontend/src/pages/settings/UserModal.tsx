import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useEffect } from "react";

export const UserModal = ({
  open,
  onClose,
  user,
  groupedPermissions,
  onSubmit,
  userLogado,
}) => {
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      papel: "USUARIO",
      telasPermitidas: [],
    },
  });

  useEffect(() => {
    if (user)
      reset({
        nome: user.nome,
        email: user.email,
        senha: "",
        confirmarSenha: "",
        papel: user.papel,
        telasPermitidas: user.telasPermitidas || [],
      });
    else reset();
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-screen overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {user ? `Editar Usuário: ${user.nome}` : "Cadastrar Novo Usuário"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nome e email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input {...register("nome")} />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  {...register("email")}
                  disabled={user?.id === userLogado.id}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Senha {user && "(opcional)"}</Label>
                <Input type="password" {...register("senha")} />
              </div>

              <div>
                <Label>Confirmar Senha</Label>
                <Input type="password" {...register("confirmarSenha")} />
              </div>
            </div>

            {/* Papel */}
            <div>
              <Label>Papel</Label>
              <select
                className="border p-2 rounded w-full"
                {...register("papel")}
                disabled={user?.id === userLogado.id}
              >
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="USUARIO">Usuário</option>
              </select>
            </div>

            {/* Permissões */}
            <Separator />
            <h4 className="font-semibold">Permissões</h4>

            <TooltipProvider>
              {groupedPermissions.map(([categoria, itens]) => (
                <div key={categoria}>
                  <h5 className="font-medium text-sm border-b pb-1 mb-2">
                    {categoria}
                  </h5>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {itens.map((item) => {
                      const checkboxId = `perm-${item.url.replace(/\//g, "")}`;

                      return (
                        <Tooltip key={item.url}>
                          <div className="flex gap-2 items-center">
                            {/* Checkbox com ID */}
                            <Controller
                              control={control}
                              name="telasPermitidas"
                              render={({ field }) => (
                                <Checkbox
                                  id={checkboxId}
                                  checked={field.value.includes(item.url)}
                                  disabled={
                                    user?.id === userLogado.id &&
                                    user?.papel === "ADMINISTRADOR"
                                  }
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [...field.value, item.url]
                                      : field.value.filter(
                                          (v) => v !== item.url
                                        );
                                    field.onChange(next);
                                  }}
                                />
                              )}
                            />

                            {/* Texto CLICÁVEL (conecta com o checkbox) */}
                            <TooltipTrigger asChild>
                              <label
                                htmlFor={checkboxId}
                                className="cursor-pointer text-sm leading-none"
                              >
                                {item.title}
                              </label>
                            </TooltipTrigger>

                            <TooltipContent>{item.description}</TooltipContent>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
