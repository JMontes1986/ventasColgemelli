
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, UserRole, NewUser, UpdatableUser } from "@/lib/types";
import { getUsers, addUser, updateUserRole, addSeedUsers } from "@/lib/services/user-service";
import { useToast } from "@/hooks/use-toast";
import { RoleGate } from "@/components/role-gate";
import { PlusCircle, Database } from "lucide-react";
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

const roleTranslations: Record<UserRole, string> = {
  admin: "Admin",
  cashier: "Cajero",
  seller: "Vendedor",
  auditor: "Auditor",
  readonly: "Solo Lectura",
};

function UserForm({
    onUserAdded,
}: {
    onUserAdded: (user: User) => void;
}) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('readonly');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setUsername('');
            setPassword('');
            setRole('readonly');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newUserData: NewUser = {
            name,
            username,
            password,
            role,
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>Complete los detalles del nuevo usuario.</DialogDescription>
                </DialogHeader>
                <form id="user-form" onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-name">Nombre Completo</Label>
                            <Input id="user-name" placeholder="Ej: Juan Pérez" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-username">Nombre de Usuario</Label>
                            <Input id="user-username" placeholder="ej: juan.perez" value={username} onChange={e => setUsername(e.target.value)} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-password">Contraseña</Label>
                            <Input id="user-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-role">Rol</Label>
                             <Select onValueChange={(value: UserRole) => setRole(value)} defaultValue={role}>
                                <SelectTrigger id="user-role">
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
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button type="submit" form="user-form">Guardar Usuario</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeeded, setHasSeeded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadUsers() {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
        if (fetchedUsers.length > 0) {
            setHasSeeded(true);
        }
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

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleSaveChanges = async (userId: string, newRole: UserRole) => {
     try {
        await updateUserRole(userId, newRole);
        toast({ title: "Éxito", description: "Rol de usuario actualizado correctamente." });
    } catch (error) {
        console.error("Error updating user role:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el rol del usuario." });
    }
  };

  const handleSeedDatabase = async () => {
    try {
        await addSeedUsers();
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
        setHasSeeded(true);
        toast({ title: "Éxito", description: "La base de datos ha sido inicializada con usuarios de ejemplo." });
    } catch (error) {
        console.error("Error seeding database:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo inicializar la base de datos." });
    }
  };


  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        description="Administrar roles y permisos de usuario."
      >
        <RoleGate allowedRoles={['admin']}>
            {!hasSeeded && !isLoading && (
                 <Button variant="outline" onClick={handleSeedDatabase}>
                    <Database className="mr-2 h-4 w-4" />
                    Cargar Usuarios de Ejemplo
                </Button>
            )}
           <UserForm onUserAdded={handleUserAdded} />
        </RoleGate>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Asigne roles a los usuarios para controlar su acceso al sistema.
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
                    <TableHead>Nombre de Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
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
                        <span className="font-medium">{user.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                        <Select
                            defaultValue={user.role}
                            onValueChange={(newRole: UserRole) => handleRoleChange(user.id, newRole)}
                        >
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
                        <Button variant="outline" onClick={() => handleSaveChanges(user.id, user.role)}>
                            Guardar Rol
                        </Button>
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
