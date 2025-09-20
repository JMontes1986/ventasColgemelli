
"use client";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, NewUser, ModulePermission } from "@/lib/types";
import { getUsers, addUser, updateUserPermissions, addSeedUsers } from "@/lib/services/user-service";
import { useToast } from "@/hooks/use-toast";
import { PermissionGate } from "@/components/permission-gate";
import { PlusCircle, Database, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMockAuth } from "@/hooks/use-mock-auth";

const moduleNames: Record<ModulePermission, string> = {
  'dashboard': 'Panel de Control',
  'sales': 'Punto de Venta',
  'self-service': 'Autogestión',
  'products': 'Productos',
  'redeem': 'Canjear Compras',
  'cashbox': 'Gestión de Caja',
  'returns': 'Devoluciones',
  'users': 'Gestión de Usuarios',
  'audit': 'Auditoría',
};

const allModules = Object.keys(moduleNames) as ModulePermission[];

function UserForm({
    mode,
    initialData,
    onUserAdded,
}: {
    mode: 'create';
    initialData?: User;
    onUserAdded: (user: User) => void;
}) {
    const { toast } = useToast();
    const [name, setName] = useState(initialData?.name || '');
    const [username, setUsername] = useState(initialData?.username || '');
    const [password, setPassword] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setName('');
            setUsername('');
            setPassword('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newUserData: NewUser = {
            name,
            username,
            password,
            permissions: allModules, // All new users get all permissions
            avatarUrl: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/100/100`,
        };

        try {
            const addedUser = await addUser(newUserData);
            onUserAdded(addedUser);
            toast({ title: "Éxito", description: "Usuario añadido correctamente." });
            setIsOpen(false);
        } catch (error) {
            console.error("Error adding user:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo añadir el usuario." });
        }
    };

    const trigger = (
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Usuario
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                        Complete los detalles del nuevo usuario. Todos los usuarios nuevos tendrán permisos de administrador.
                    </DialogDescription>
                </DialogHeader>
                <form id={`user-form-${initialData?.id || 'create'}`} onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-name">Nombre Completo</Label>
                            <Input id="user-name" placeholder="Ej: Juan Pérez" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-username">Nombre de Usuario</Label>
                            <Input id="user-username" placeholder="ej: juan.perez" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-password">Contraseña</Label>
                            <Input id="user-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                    <Button type="submit" form={`user-form-${initialData?.id || 'create'}`}>Guardar Usuario</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useMockAuth();

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        let fetchedUsers = await getUsers();
        if (fetchedUsers.length === 0) {
          // If no users, seed them and refetch
          await addSeedUsers();
          fetchedUsers = await getUsers();
        }
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los usuarios." });
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, [toast]);

  const handleUserAdded = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        description="Administrar usuarios. Actualmente todos los usuarios tienen permisos de administrador."
      >
        <PermissionGate requiredPermission="users">
           <UserForm mode="create" onUserAdded={handleUserAdded} />
        </PermissionGate>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Una lista de todos los usuarios del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Permisos</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.username}</p>
                        </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-md">
                           <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Administrador Total</span>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
