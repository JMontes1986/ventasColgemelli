
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gem, LogIn } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="usuario@colegemelli.edu" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full" asChild>
            <Link href="/dashboard">
                <LogIn className="mr-2 h-4 w-4" />
                Ingresar
            </Link>
          </Button>
           <p className="mt-4 text-center text-xs text-muted-foreground">
            Use el selector de roles en el panel para simular diferentes usuarios.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
