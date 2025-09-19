import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUsers } from "@/lib/placeholder-data";
import type { UserRole } from "@/lib/types";

const roleTranslations: Record<UserRole, string> = {
  admin: "Admin",
  cashier: "Cajero",
  seller: "Vendedor",
  auditor: "Auditor",
  readonly: "Solo Lectura",
};

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        description="Administrar roles y permisos de usuario."
      />
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Asigne roles a los usuarios para controlar su acceso al sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select defaultValue={user.role}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">{roleTranslations.admin}</SelectItem>
                            <SelectItem value="cashier">{roleTranslations.cashier}</SelectItem>
                            <SelectItem value="seller">{roleTranslations.seller}</SelectItem>
                            <SelectItem value="auditor">{roleTranslations.auditor}</SelectItem>
                            <SelectItem value="readonly">{roleTranslations.readonly}</SelectItem>
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline">Guardar Rol</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
