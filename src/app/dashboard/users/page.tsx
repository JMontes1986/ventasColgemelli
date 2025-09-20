
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
    onUserUpdated,
}: {
    mode: 'create' | 'edit';
    initialData?: User;
    onUserAdded: (user: User) => void;
    onUserUpdated: (user: User) => void;
}) {
    const { toast } = useToast();
    const [name, setName] = useState(initialData?.name || '');
    const [username, setUsername] = useState(initialData?.username || '');
    const [password, setPassword] = useState('');
    const [permissions, setPermissions] = useState<ModulePermission[]>(initialData?.permissions || []);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            if (mode === 'edit' && initialData) {
                setName(initialData.name);
                setUsername(initialData.username);
                setPassword('');
                setPermissions(initialData.permissions || []);
            } else {
                setName('');
                setUsername('');
                setPassword('');
                setPermissions([]);
            }
        }
    };

    const handlePermissionChange = (permission: ModulePermission, checked: boolean) => {
        setPermissions(prev =>
            checked ? [...prev, permission] : prev.filter(p => p !== permission)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'create') {
            const newUserData: NewUser = {
                name,
                username,
                password,
                permissions,
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
        } else if (mode === 'edit' && initialData) {
            try {
                await updateUserPermissions(initialData.id, permissions);
                const updatedUser = { ...initialData, permissions };
                onUserUpdated(updatedUser);
                toast({ title: "Éxito", description: "Permisos actualizados." });
                setIsOpen(false);
            } catch (error) {
                console.error("Error updating user:", error);
                toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el usuario." });
            }
        }
    };

    const trigger = mode === 'create' ? (
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Usuario
        </Button>
    ) : (
        <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar Permisos
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Permisos'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Complete los detalles del nuevo usuario.' : `Editando permisos para ${initialData?.name}.`}
                    </DialogDescription>
                </DialogHeader>
                <form id={`user-form-${initialData?.id || 'create'}`} onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-name">Nombre Completo</Label>
                            <Input id="user-name" placeholder="Ej: Juan Pérez" value={name} onChange={e => setName(e.target.value)} required disabled={mode === 'edit'} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-username">Nombre de Usuario</Label>
                            <Input id="user-username" placeholder="ej: juan.perez" value={username} onChange={e => setUsername(e.target.value)} required disabled={mode === 'edit'} />
                        </div>
                        {mode === 'create' && (
                            <div className="space-y-2">
                                <Label htmlFor="user-password">Contraseña</Label>
                                <Input id="user-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Permisos de Módulo</Label>
                            <div className="space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
                                {allModules.map(permission => (
                                    <div key={permission} className="flex items-center justify-between">
                                        <Label htmlFor={`perm-${permission}`}>{moduleNames[permission]}</Label>
                                        <Switch
                                            id={`perm-${permission}`}
                                            checked={permissions.includes(permission)}
                                            onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                    <Button type="submit" form={`user-form-${initialData?.id || 'create'}`}>{mode === 'create' ? 'Guardar Usuario' : 'Guardar Cambios'}</Button>
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

  const handleUserUpdated = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
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
        description="Administrar usuarios y sus permisos de acceso a módulos."
      >
        <PermissionGate requiredPermission="users">
            {!hasSeeded && !isLoading && (
                 <Button variant="outline" onClick={handleSeedDatabase}>
                    <Database className="mr-2 h-4 w-4" />
                    Cargar Usuarios de Ejemplo
                </Button>
            )}
           <UserForm mode="create" onUserAdded={handleUserAdded} onUserUpdated={handleUserUpdated} />
        </PermissionGate>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Una lista de todos los usuarios y los módulos a los que tienen acceso.
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
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.username}</p>
                        </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-md">
                           {user.permissions?.map(p => (
                               <span key={p} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{moduleNames[p]}</span>
                           )) || <span className="text-xs text-muted-foreground">Sin permisos</span>}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <PermissionGate requiredPermission="users">
                            <UserForm mode="edit" initialData={user} onUserAdded={handleUserAdded} onUserUpdated={handleUserUpdated} />
                        </PermissionGate>
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
