
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DoorOpen, DoorClosed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { CashboxSession } from "@/lib/types";

const currentSession: CashboxSession | undefined = undefined; // No current session by default
const cashboxSessions: CashboxSession[] = []; // No sessions by default

export default function CashboxPage() {
    const [openingBalance, setOpeningBalance] = useState("");

    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-digit characters
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const numericValue = parseInt(rawValue, 10);

        if (isNaN(numericValue)) {
            setOpeningBalance("");
        } else {
            // Format with thousand separators for display
            setOpeningBalance(new Intl.NumberFormat('es-CO').format(numericValue));
        }
    };

    return (
        <div>
            <PageHeader
                title="Gestión de Caja"
                description="Abrir, cerrar y revisar las sesiones de caja."
            />
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {currentSession ? "Sesión Actual" : "Nueva Sesión"}
                            </CardTitle>
                            <CardDescription>
                                {currentSession ? `Sesión para ${currentSession.userName}` : "Iniciar una nueva sesión de caja para el día."}
                            </CardDescription>
                        </CardHeader>
                        {currentSession ? (
                            <>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Saldo de Apertura:</span>
                                        <span className="font-medium">{formatCurrency(currentSession.openingBalance)}</span>
                                    </div>
                                     <div className="flex justify-between">
                                        <span className="text-muted-foreground">Ventas Totales:</span>
                                        <span className="font-medium">{formatCurrency(currentSession.totalSales)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Esperado en Caja:</span>
                                        <span>{formatCurrency(currentSession.openingBalance + currentSession.totalSales)}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="destructive" className="w-full">
                                        <DoorClosed className="mr-2 h-4 w-4" />
                                        Cerrar Caja
                                    </Button>
                                </CardFooter>
                            </>
                        ) : (
                             <>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="opening-balance">Saldo de Apertura</Label>
                                        <Input 
                                            id="opening-balance" 
                                            type="text" 
                                            placeholder="100.000" 
                                            value={openingBalance}
                                            onChange={handleBalanceChange}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                        <DoorOpen className="mr-2 h-4 w-4" />
                                        Abrir Caja
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Sesiones</CardTitle>
                            <CardDescription>Revisión de sesiones de caja anteriores.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha de Cierre</TableHead>
                                        <TableHead className="text-right">Saldo de Cierre</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cashboxSessions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No hay sesiones de caja.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        cashboxSessions.map(session => (
                                            <TableRow key={session.id}>
                                                <TableCell>{session.userName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn(session.status === 'open' ? 'text-green-700 border-green-300' : 'text-gray-700 border-gray-300', "capitalize")}>
                                                        {session.status === 'open' ? 'Abierta' : 'Cerrada'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {session.closedAt ? new Date(session.closedAt).toLocaleString() : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {session.closingBalance ? formatCurrency(session.closingBalance) : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
