
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Undo2, CheckCircle, PackageSearch } from "lucide-react";
import { getProducts, increaseProductStock } from '@/lib/services/product-service';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from '@/lib/utils';

export default function ReturnsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastReturn, setLastReturn] = useState<{ name: string; quantity: number } | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        async function loadProducts() {
            setIsLoading(true);
            try {
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error de Carga',
                    description: 'No se pudieron cargar los productos.'
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadProducts();
    }, [toast]);

    const handleReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedProductId) {
            toast({
                variant: 'destructive',
                title: 'Campo Requerido',
                description: 'Por favor seleccione un producto.'
            });
            return;
        }

        if (quantity <= 0) {
            toast({
                variant: 'destructive',
                title: 'Cantidad Inválida',
                description: 'La cantidad a devolver debe ser mayor que cero.'
            });
            return;
        }

        setIsProcessing(true);
        setLastReturn(null);

        try {
            await increaseProductStock(selectedProductId, quantity);
            
            const returnedProduct = products.find(p => p.id === selectedProductId);
            
            if (returnedProduct) {
                // Update local state to reflect new stock
                setProducts(prevProducts => 
                    prevProducts.map(p => 
                        p.id === selectedProductId 
                        ? { ...p, stock: p.stock + quantity } 
                        : p
                    )
                );
                setLastReturn({ name: returnedProduct.name, quantity });
            }
            
            toast({
                title: 'Devolución Exitosa',
                description: `Se devolvió ${returnedProduct?.name} (x${quantity}) al stock.`,
            });

            // Reset form
            setSelectedProductId('');
            setQuantity(1);

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
    
    const selectedProduct = products.find(p => p.id === selectedProductId);

    return (
        <div>
            <PageHeader
                title="Gestión de Devoluciones"
                description="Seleccione un producto para devolverlo al inventario."
            />
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <form onSubmit={handleReturn}>
                        <CardHeader>
                            <CardTitle>Procesar Devolución de Producto</CardTitle>
                            <CardDescription>
                                Elija el producto y la cantidad para agregarlo de nuevo al stock.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="product-select">Producto a Devolver</Label>
                                <Select 
                                    value={selectedProductId}
                                    onValueChange={setSelectedProductId}
                                    disabled={isLoading || isProcessing}
                                >
                                    <SelectTrigger id="product-select">
                                        <SelectValue placeholder="Seleccione un producto..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoading ? (
                                            <SelectItem value="loading" disabled>Cargando productos...</SelectItem>
                                        ) : (
                                            products.map(product => (
                                                <SelectItem key={product.id} value={product.id}>
                                                    {product.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="quantity">Cantidad a Devolver</Label>
                                <Input 
                                    id="quantity" 
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                    disabled={!selectedProductId || isProcessing}
                                />
                            </div>
                            {selectedProduct && (
                                <div className="text-sm text-muted-foreground">
                                    <p>Stock actual: {selectedProduct.stock}</p>
                                    <p>Stock después de la devolución: {selectedProduct.stock + quantity}</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={isProcessing || !selectedProductId}>
                                <Undo2 className="mr-2 h-4 w-4" />
                                {isProcessing ? 'Procesando...' : 'Confirmar Devolución'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="bg-muted/30">
                     <CardHeader>
                        <CardTitle>Última Devolución</CardTitle>
                        <CardDescription>
                            Aquí se mostrará la información de la última devolución procesada.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lastReturn ? (
                            <div className="flex flex-col items-center justify-center text-center gap-4 p-8 bg-green-500/10 rounded-lg">
                                <CheckCircle className="h-16 w-16 text-green-600" />
                                <h3 className="text-xl font-semibold">Devolución Completada</h3>
                                <p className="text-muted-foreground">
                                   Se devolvieron <span className="font-bold">{lastReturn.quantity}</span> unidades de <span className="font-bold">{lastReturn.name}</span> al inventario.
                                </p>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
                                <PackageSearch className="h-16 w-16 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                   Complete el formulario para procesar una devolución.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
