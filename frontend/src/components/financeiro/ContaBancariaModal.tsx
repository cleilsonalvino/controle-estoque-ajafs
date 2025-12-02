// src/components/financeiro/ContaBancariaModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useFinanceiro } from "@/contexts/FinanceiroContext";

const formSchema = z.object({
  nome: z.string().min(1, "Informe o nome da conta"),
  saldoInicial: z.string().min(1, "Informe o saldo inicial"),
  tipo: z.string().min(1, "Informe o tipo da conta"),
  banco: z.string().optional(),
  observacoes: z.string().optional(),
});

interface ContaBancariaModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ContaBancariaModal = ({
  children,
  open,
  onOpenChange,
}: ContaBancariaModalProps) => {

  const { createContaBancaria } = useFinanceiro();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function parseCurrency(valor: string) {
    return Number(valor.replace(/[^\d,]/g, "").replace(",", "."));
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createContaBancaria({
        nome: values.nome,
        tipoConta: values.tipo.toUpperCase(),   // Corrente, Poupança → CORRENTE, POUPANCA
        banco: values.banco || null,
        saldoInicial: parseCurrency(values.saldoInicial),
        observacoes: values.observacoes || "",
        ativo: true,
      });

      form.reset();
      onOpenChange?.(false);

    } catch (error) {
      console.error("Erro ao criar conta bancária", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Conta Bancária</DialogTitle>
          <DialogDescription className="sr-only">
            Formulário de criação de conta bancária
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Conta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Conta Corrente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saldoInicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Inicial</FormLabel>
                  <FormControl>
                    <Input placeholder="R$ 0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Conta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: CORRENTE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Banco do Brasil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes adicionais..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Salvar
            </Button>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
