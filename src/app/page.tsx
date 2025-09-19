import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Gem } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4 flex items-center gap-3 text-primary">
            <Gem className="h-10 w-10" />
            <h1 className="font-headline text-4xl font-bold">
                Ventas ColGemelli
            </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Bienvenido al portal de autoservicio para la compra de boletos. Siga los pasos a continuación para comprar y reclamar sus boletos de forma segura y sencilla.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Paso 1: Comprar Boletos</CardTitle>
            <CardDescription>
              Seleccione la cantidad de boletos que desea comprar y genere su código de pago único.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="tickets">Cantidad de Boletos</Label>
                  <Input id="tickets" type="number" placeholder="Ej: 2" defaultValue="1" min="1" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Generar Código de Pago</Button>
            <div className="w-full text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Instrucciones de Pago</h4>
              <p>
                Después de generar su código, será redirigido a la aplicación Daviplata de la escuela para completar el pago. Por favor, guarde su código de pago para reclamar sus boletos más tarde.
              </p>
            </div>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Paso 2: Reclamar Boletos</CardTitle>
            <CardDescription>
              Una vez que haya completado el pago, ingrese su código aquí para autorizar la compra y reclamar sus boletos en la taquilla.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="payment-code">Código de Pago</Label>
                  <Input id="payment-code" placeholder="Ingrese su código de pago único" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Autorizar y Reclamar Boletos</Button>
          </CardFooter>
        </Card>
      </div>
      
      <Separator className="my-8" />

      <footer className="text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Colegio Gemelli. Todos los derechos reservados.</p>
        <p>Desarrollado para simplificar la gestión de eventos escolares.</p>
      </footer>
    </main>
  );
}
