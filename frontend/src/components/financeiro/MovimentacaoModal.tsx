// src/components/financeiro/MovimentacaoModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { DialogDescription } from "@radix-ui/react-dialog";

const formSchema = z.object({
  tipo: z.enum(["entrada", "saida"]),
  categoria: z.string().min(1, "Selecione uma categoria"),
  valor: z.string().min(1, "Informe o valor"),
  data: z.date({ required_error: "Informe a data" }),
  contaBancaria: z.string().min(1, "Selecione uma conta"),
  metodoPagamento: z.string().min(1, "Selecione o método"),
  observacoes: z.string().optional(),
});

interface MovimentacaoModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MovimentacaoModal = ({
  children,
  open,
  onOpenChange,
}: MovimentacaoModalProps) => {
  const {
    categorias = [],
    contasBancarias = [],
    createMovimentacao, // ajuste o nome aqui se no contexto for diferente
  } = useFinanceiro();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "saida",
      observacoes: "",
    },
  });

  function parseCurrencyToNumber(valor: string): number {
    const somenteDigitos = valor.replace(/[^\d,]/g, "");
    const comPonto = somenteDigitos.replace(",", ".");
    const numero = parseFloat(comPonto);
    return Number.isNaN(numero) ? 0 : numero;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      tipo: values.tipo, // entrada ou saida
      categoriaId: values.categoria,
      contaBancariaId: values.contaBancaria,
      metodoPagamento: values.metodoPagamento,
      valor: parseCurrencyToNumber(values.valor),
      data: values.data,
      observacoes: values.observacoes || "",
    };

    try {
      if (createMovimentacao) {
        await createMovimentacao(payload as any);
      } else {
        console.log("Payload movimentacao:", payload);
      }

      form.reset({
        tipo: "saida",
        categoria: "",
        valor: "",
        data: undefined,
        contaBancaria: "",
        metodoPagamento: "",
        observacoes: "",
      });

      onOpenChange?.(false);
    } catch (error) {
      console.error("Erro ao criar movimentacao", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Movimentacao</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saida</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Nenhuma categoria cadastrada
                        </div>
                      ) : (
                        categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "P", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contaBancaria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta bancaria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contasBancarias.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Nenhuma conta cadastrada
                        </div>
                      ) : (
                        contasBancarias.map((conta) => (
                          <SelectItem key={conta.id} value={conta.id}>
                            {conta.nome} {conta.banco ? `(${conta.banco})` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metodoPagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metodo de pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o metodo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="cartao">Cartao de credito</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observacoes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes adicionais..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Registrar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
