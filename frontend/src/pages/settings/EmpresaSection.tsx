import { useForm, Controller } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputMask from "react-input-mask";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const EmpresaSection = ({ empresa, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);

  const { handleSubmit, control, register, setValue, reset, formState } = useForm({
    defaultValues: empresa || {},
  });

  useEffect(() => {
    if (empresa) reset(empresa);
  }, [empresa]);

  const handleCepBlur = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;

    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${clean}/json/`);
      if (!data.erro) {
        setValue("endereco", data.logradouro);
        setValue("bairro", data.bairro);
        setValue("cidade", data.localidade);
        setValue("estado", data.uf);
      }
    } catch {
      toast.error("Erro ao buscar CEP");
    }
  };

  const getImageUrl = (value) => {
    if (!value) return "https://placehold.co/600x400?text=Sem+Imagem";

    if (value instanceof File) return URL.createObjectURL(value);

    if (value.startsWith("http")) return value;

    const clean = value.startsWith("/") ? value.slice(1) : value;
    return `${import.meta.env.VITE_API_URL}/${clean}`;
  };

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            Informações da Empresa
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button type="button" variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancelar Edição" : "Editar Informações"}
            </Button>
          </div>

          {/* CNPJ + Razão Social */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>CNPJ / CPF</Label>
              <Controller
                name="cnpj"
                control={control}
                render={({ field }) => (
                  <InputMask {...field} mask="99.999.999/9999-99" disabled={!isEditing}>
                    {(props) => <Input {...props} />}
                  </InputMask>
                )}
              />
            </div>

            <div>
              <Label>Razão Social / Nome</Label>
              <Input {...register("razao_social")} disabled={!isEditing} />
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo da Empresa</Label>
            <Input
              type="file"
              accept="image/*"
              {...register("logoEmpresa")}
              disabled={!isEditing}
            />
          </div>

          {empresa?.logoEmpresa && (
            <div className="mt-2 flex justify-center">
              <img
                src={getImageUrl(empresa.logoEmpresa)}
                className="w-32 h-32 object-contain border rounded-md shadow"
              />
            </div>
          )}

          <Separator />

          <h3 className="font-semibold text-md">Contato e Endereço</h3>

          {/* Telefone + Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Telefone</Label>
              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <InputMask {...field} mask="(99) 99999-9999" disabled={!isEditing}>
                    {(props) => <Input {...props} />}
                  </InputMask>
                )}
              />
            </div>

            <div>
              <Label>E-mail</Label>
              <Input {...register("email")} disabled={!isEditing} />
            </div>
          </div>

          {/* CEP/Estado/Cidade */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>CEP</Label>
              <Controller
                name="cep"
                control={control}
                render={({ field }) => (
                  <InputMask
                    {...field}
                    mask="99999-999"
                    disabled={!isEditing}
                    onBlur={(e) => {
                      field.onBlur();
                      if (isEditing) handleCepBlur(e.target.value);
                    }}
                  >
                    {(props) => <Input {...props} />}
                  </InputMask>
                )}
              />
            </div>

            <div>
              <Label>Estado</Label>
              <Input {...register("estado")} disabled={!isEditing} />
            </div>

            <div>
              <Label>Cidade</Label>
              <Input {...register("cidade")} disabled={!isEditing} />
            </div>
          </div>

          {/* Endereço + Número + Bairro */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Endereço</Label>
              <Input {...register("endereco")} disabled={!isEditing} />
            </div>
            <div>
              <Label>Número</Label>
              <Input {...register("numero")} disabled={!isEditing} />
            </div>
            <div className="md:col-span-3">
              <Label>Bairro</Label>
              <Input {...register("bairro")} disabled={!isEditing} />
            </div>
          </div>
        </CardContent>

        {isEditing && (
          <CardFooter className="flex justify-end">
            <Button type="submit">Salvar Alterações</Button>
          </CardFooter>
        )}
      </Card>
    </form>
  );
};
