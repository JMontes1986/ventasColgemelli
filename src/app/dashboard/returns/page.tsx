
"use client";

import { useState } from 'react';
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Info, AlertTriangle, Undo2, CheckCircle } from "lucide-react";
import { getPurchaseById, updatePurchase } from '@/lib/services/purchase-service';
import { increaseProductStock } from '@/lib/services/product-service';
import type { Purchase, CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReturnsPage() {
    const [searchCode, setSearchCode] = useState('');
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!searchCode) {
            toast({
                variant: 'destructive',
                title: 'Campo Requerido',
                description: 'Por favor ingrese un código de compra.'
            });
            return;
        }

        setIsLoading(true);
        setSearchPerformed(true);
        setPurchase(null);

        try {
            const result = await getPurchaseById(searchCode);
            setPurchase(result);
        } catch (error) {
            console.error("Error searching purchase:", error);
            toast({
                variant: 'destructive',
                title: 'Error de Búsqueda',
                description: 'No se pudo encontrar la compra. Intente de nuevo.'
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleReturn = async (itemToReturn: Omit<CartItem, 'type'>) => {
        if (!purchase) return;

        setIsProcessing(true);
        try {
            // 1. Increase product stock
            await increaseProductStock(itemToReturn.id, itemToReturn.quantity);
            
            // 2. Mark item as returned in the purchase
            const updatedItems = purchase.items.map(item => 
                item.id === itemToReturn.id ? { ...item, returned: true } : item
            );
            
            const updatedPurchaseData = { ...purchase, items: updatedItems };
            await updatePurchase(purchase.id, { items: updatedItems });

            // 3. Update local state to reflect the change
            setPurchase(updatedPurchaseData);
            
            toast({
                title: 'Devolución Exitosa',
                description: `Se devolvió ${itemToReturn.name} (x${itemToReturn.quantity}) al stock.`,
            });
        } catch (error) {
            console.error("Error processing return:", error);
            toast({
                variant: 'destructive',
                title: 'Error en la Devolución',
                description: 'No se pudo procesar la devolución. Intente de nuevo.'
            });
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <div>
            <PageHeader
                title="Gestión de Devoluciones"
                description="Busque una compra por código para procesar la devolución de productos."
            />
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <form onSubmit={handleSearch}>
                        <CardHeader>
                            <CardTitle>Buscar Compra</CardTitle>
                            <CardDescription>
                                Ingrese el código de la compra (ej. CGX0001) para ver los detalles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="purchase-code">Código de Compra</Label>
                                <Input 
                                    id="purchase-code" 
                                    placeholder="ej., CGA0042" 
                                    className="font-mono" 
                                    value={searchCode}
                                    onChange={e => setSearchCode(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                <Search className="mr-2 h-4 w-4" />
                                {isLoading ? 'Buscando...' : 'Buscar Compra'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="bg-muted/30">
                     <CardHeader>
                        <CardTitle>Resultados de la Búsqueda</CardTitle>
                        <CardDescription>
                            Los detalles de la compra encontrada se mostrarán aquí.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <p>Buscando...</p>
                            </div>
                        ) : !searchPerformed ? (
                             <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
                                <Info className="h-16 w-16 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                   Ingrese un código y haga clic en "Buscar Compra".
                                </p>
                            </div>
                        ) : purchase ? (
                            <div>
                                <div className="mb-4 space-y-1">
                                    <p><strong>Código:</strong> <span className="font-mono">{purchase.id}</span></p>
                                    <p><strong>Fecha:</strong> {purchase.date}</p>
                                    <p><strong>Cliente:</strong> Cédula {purchase.cedula} / Celular {purchase.celular}</p>
                                    <p className="text-lg font-bold">Total: {formatCurrency(purchase.total)}</p>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Cant.</TableHead>
                                            <TableHead>Precio</TableHead>
                                            <TableHead className="text-right">Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchase.items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{formatCurrency(item.price)}</TableCell>
                                                <TableCell className="text-right">
                                                    {item.returned ? (
                                                        <div className="flex items-center justify-end text-green-600 gap-2">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span>Devuelto</span>
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => handleReturn(item)}
                                                            disabled={isProcessing}
                                                        >
                                                            <Undo2 className="mr-2 h-4 w-4" />
                                                            Devolver
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
                                <AlertTriangle className="h-16 w-16 text-destructive" />
                                <h3 className="text-xl font-semibold">No se encontró la compra</h3>
                                <p className="text-muted-foreground">
                                   Verifique que el código sea correcto e intente nuevamente.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    