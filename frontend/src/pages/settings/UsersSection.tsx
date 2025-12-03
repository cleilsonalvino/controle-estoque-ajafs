import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus } from "lucide-react";

export const UsersSection = ({
  users,
  userLogado,
  onNew,
  onEdit,
  onDelete,
  onDetails,
}) => {
  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Gerencie os acessos do sistema</CardDescription>
        </div>

        <Button onClick={onNew}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </CardHeader>

      <CardContent>
        <table className="table-auto w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Papel</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td
                  className="p-2 border cursor-pointer text-blue-600 underline"
                  onClick={() => onDetails(u)}
                >
                  {u.nome}
                </td>

                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.papel}</td>

                <td className="p-2 border">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(u)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {u.id === userLogado.id ? (
                      <Button variant="secondary" size="sm" disabled>
                        Você
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
