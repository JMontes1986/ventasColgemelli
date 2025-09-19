import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, TicketCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RedeemPage() {
    return (
        <div>
            <PageHeader
                title="Canjear Boleto"
                description="Escanee o ingrese un código de boleto para validarlo y canjearlo."
            />
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Escanear Boleto</CardTitle>
                        <CardDescription>
                            Ingrese el código único del código QR del boleto a continuación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ticket-code">Código del Boleto</Label>
                                <Input id="ticket-code" placeholder="ej., CG2024-C3D4" className="font-mono" />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full">
                            <QrCode className="mr-2 h-4 w-4" />
                            Canjear Boleto
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="bg-muted/30">
                     <CardHeader>
                        <CardTitle>Estado del Último Escaneo</CardTitle>
                        <CardDescription>
                            Resultado del intento de canje más reciente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center gap-4 p-8">
                        <TicketCheck className="h-16 w-16 text-green-500" />
                        <h3 className="text-xl font-semibold">Boleto Canjeado Exitosamente</h3>
                        <p className="text-muted-foreground">
                           Código: <span className="font-mono">CG2024-C3D4</span>
                        </p>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-700">
                            Canjeado
                        </Badge>
                    </CardContent>
                    {/* Ejemplo de un estado de error */}
                    {/* <CardContent className="flex flex-col items-center justify-center text-center gap-4 p-8">
                        <AlertTriangle className="h-16 w-16 text-destructive" />
                        <h3 className="text-xl font-semibold">Boleto Inválido o Canjeado</h3>
                        <p className="text-muted-foreground">
                           Este boleto ya ha sido utilizado o no existe.
                        </p>
                    </CardContent> */}
                </Card>
            </div>
        </div>
    );
}
