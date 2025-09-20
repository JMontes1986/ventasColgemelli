
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gem, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticateUser, addUser } from "@/lib/services/user-service";
import { useMockAuth } from "@/hooks/use-mock-auth";
import type { NewUser, ModulePermission } from "@/lib/types";
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

const allModules: ModulePermission[] = [
  'dashboard', 'sales', 'self-service', 'products', 'redeem', 
  'cashbox', 'returns', 'users', 'audit'
];


function CreateUserForm({ onUserCreated }: { onUserCreated: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newUser: NewUser = {
        name,
        username,
        password,
        permissions: allModules, // Assign all permissions by default
        avatarUrl: `https://picsum.photos/seed/${username}/100/100`,
      };
      await addUser(newUser);
      toast({
        title: "Usuario creado",
        description: "Tu cuenta ha sido creada con permisos de administrador.",
      });
      onUserCreated();
      setIsOpen(false); // Close the dialog on success
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Error al crear usuario",
        description: "No se pudo crear la cuenta. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="mt-4">
          Crear una cuenta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Cuenta</DialogTitle>
          <DialogDescription>
            Completa el formulario para registrarte. Las nuevas cuentas tendrán acceso de administrador.
          </DialogDescription>
        </DialogHeader>
        <form id="create-user-form" onSubmit={handleCreateUser}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nombre Completo</Label>
              <Input
                id="new-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-username">Nombre de Usuario</Label>
              <Input
                id="new-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isLoading}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="create-user-form" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Cuenta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useMockAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0); // Key to force re-fetch in auth hook

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authenticatedUser = await authenticateUser(username, password);
      if (authenticatedUser) {
        login(authenticatedUser);
        toast({
          title: "Inicio de sesión exitoso",
          description: `¡Bienvenido de nuevo, ${authenticatedUser.name}!`,
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "El usuario o la contraseña son incorrectos.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error del sistema",
        description: "No se pudo conectar con el servicio de autenticación.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserCreation = () => {
    // Invalidate user cache by forcing a re-render of the parent component
    // that uses the useMockAuth hook, triggering a re-fetch.
    // A more robust solution might involve a global state management library.
     sessionStorage.removeItem("all_users");
     setKey(prev => prev + 1);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4" key={key}>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center gap-3 text-primary">
            <Gem className="h-10 w-10" />
            <h1 className="font-headline text-3xl font-bold">
              Ventas ColGemelli
            </h1>
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingrese a su cuenta para acceder al panel de ventas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="su.usuario"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full" type="submit" form="login-form" disabled={isLoading}>
            <LogIn className="mr-2 h-4 w-4" />
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
          <CreateUserForm onUserCreated={handleUserCreation} />
        </CardFooter>
      </Card>
    </main>
  );
}
