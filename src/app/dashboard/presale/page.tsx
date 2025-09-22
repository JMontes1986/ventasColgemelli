
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product, Purchase } from "@/lib/types";
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
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Minus } from "lucide-react";
import { formatCurrency, cn } from '@/lib/utils';
import { getProducts } from '@/lib/services/product-service';
import { addPreSalePurchase, type NewPurchase } from '@/lib/services/purchase-service';
import { useToast } from '@/hooks/use-toast';
import { useMockAuth } from '@/hooks/use-mock-auth';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
};

export default function PreSalePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const { toast } = useToast();
  const { currentUser } = useMockAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addToCart = (item: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1, stock: item.stock }];
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.id !== id);
      }
      return prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };
  
  const clearCart = () => {
    setCart([]);
    setCustomerIdentifier('');
  };

  const handlePreSale = async () => {
    if (cart.length === 0) {
        toast({ variant: "destructive", title: "Error", description: "El carrito está vacío." });
        return;
    }
    if (!customerIdentifier) {
        toast({ variant: "destructive", title: "Error", description: "Debe ingresar la cédula o código del estudiante." });
        return;
    }
    setIsProcessing(true);

    const newPreSaleData: NewPurchase = {
        date: new Date().toLocaleString('es-CO'),
        total: subtotal,
        items: cart.map(({ stock, ...item }) => item), // Remove stock from saved items
        cedula: customerIdentifier,
        celular: 'N/A', // Not required for pre-sales
        sellerId: currentUser?.id,
        sellerName: currentUser?.name,
        status: 'pre-sale',
    };

    try {
        await addPreSalePurchase(newPreSaleData);
        toast({ title: "Preventa Exitosa", description: "La preventa ha sido registrada correctamente." });
        clearCart();
    } catch (error) {
        console.error("Error creating pre-sale:", error);
        toast({ variant: "destructive", title: "Error en la Preventa", description: (error as Error).message || "No se pudo registrar la preventa." });
    } finally {
        setIsProcessing(false);
    }
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div>
      <PageHeader
        title="Registro de Preventa"
        description="Registre ventas que no dependen del stock inicial para planificar el inventario."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <Card>
            <CardHeader>
                <CardTitle>Todos los Productos</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[70vh]">
                     {isLoading ? (
                        <p className="text-muted-foreground p-3">Cargando productos...</p>
                     ) : (
                        <div className="flex flex-col gap-2">
                            {products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-secondary rounded-md flex-shrink-0 relative">
                                           <Image 
                                                src={product.imageUrl}
                                                alt={product.name}
                                                width={200}
                                                height={200}
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">Stock Actual: {product.stock}</Badge>
                                        <Button onClick={() => addToCart(product)}>
                                            Agregar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                </ScrollArea>
            </CardContent>
        </Card>

        <div>
          <Card className="bg-blue-950 text-white lg:sticky top-20">
            <CardHeader>
              <CardTitle>Carrito de Preventa</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64 mb-4">
                    {cart.length === 0 ? (
                        <p className="text-center text-blue-300">El carrito está vacío</p>
                    ) : (
                        <Table>
                            <TableBody>
                                {cart.map(item => (
                                    <TableRow key={item.id} className="border-blue-800 hover:bg-blue-900">
                                        <TableCell className="text-white font-medium">{item.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button size="icon" variant="outline" className="h-6 w-6 bg-blue-800 border-blue-700 hover:bg-blue-700" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newQuantity = parseInt(e.target.value, 10);
                                                        if (!isNaN(newQuantity)) {
                                                          updateQuantity(item.id, newQuantity);
                                                        }
                                                    }}
                                                    className="w-12 h-6 text-center bg-blue-900 border-blue-700"
                                                />
                                                <Button size="icon" variant="outline" className="h-6 w-6 bg-blue-800 border-blue-700 hover:bg-blue-700" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-green-400 font-semibold">{formatCurrency(item.price * item.quantity)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-500/20 hover:text-red-400" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>
                <div className="space-y-4 text-lg">
                    <div className="space-y-2">
                        <Label htmlFor="customer-id" className="text-white">Cédula o Código de Estudiante</Label>
                        <Input 
                            id="customer-id"
                            value={customerIdentifier}
                            onChange={(e) => setCustomerIdentifier(e.target.value)}
                            className="bg-blue-900 border-blue-700 text-white"
                            placeholder="Ingrese identificación..."
                            required
                        />
                    </div>
                    <div className="flex justify-between font-bold border-t border-blue-800 pt-4 mt-4">
                        <span>TOTAL</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                 <Button 
                    className="w-full text-lg h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    onClick={handlePreSale}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Procesando...' : 'Registrar Preventa'}
                </Button>
                <Button variant="destructive" className="w-full text-lg h-12" onClick={clearCart}>
                    Vaciar Carrito
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
