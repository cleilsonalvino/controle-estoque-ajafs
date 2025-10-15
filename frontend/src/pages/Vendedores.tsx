
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Vendedores = () => {
  // Mock data for now
  const vendedores = [
    { id: 1, nome: 'Vendedor 1', email: 'vendedor1@example.com', meta: 'R$ 10.000,00' },
    { id: 2, nome: 'Vendedor 2', email: 'vendedor2@example.com', meta: 'R$ 15.000,00' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Vendedores</h1>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendedores</CardTitle>
          <CardDescription>Gerencie seus vendedores.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button>Adicionar Vendedor</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendedores.map((vendedor) => (
                <TableRow key={vendedor.id}>
                  <TableCell>{vendedor.nome}</TableCell>
                  <TableCell>{vendedor.email}</TableCell>
                  <TableCell>{vendedor.meta}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button variant="destructive" size="sm" className="ml-2">Excluir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vendedores;
