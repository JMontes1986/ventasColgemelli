
"use client";

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { mockProducts } from '@/lib/placeholder-data';
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Minus, ShoppingCart, Sparkles, History } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from 'next/link';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product';
};

type Purchase = {
    code: string;
    date: string;
    total: number;
    items: CartItem[];
}

const PURCHASE_HISTORY_KEY = 'purchase_history';

export default function SelfServicePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem(PURCHASE_HISTORY_KEY);
        if (storedHistory) {
            setPurchaseHistory(JSON.parse(storedHistory));
        }
    } catch (error) {
        console.warn("Could not read purchase history from localStorage", error);
    }
  }, []);

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
      return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1, type: 'product' }];
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
  };

  const handlePayment = () => {
    if (cart.length === 0) return;
    const code = `CG-PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newPurchase: Purchase = {
        code,
        date: new Date().toLocaleString('es-CO'),
        total: subtotal,
        items: cart
    };

    const updatedHistory = [newPurchase, ...purchaseHistory];
    setPurchaseHistory(updatedHistory);
    try {
        localStorage.setItem(PURCHASE_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.warn("Could not save purchase history to localStorage", error);
    }

    setPaymentCode(code);
    setIsPaymentModalOpen(true);
  };

  const closeModal = () => {
      setIsPaymentModalOpen(false);
      setPaymentCode(null);
      clearCart();
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b">
         <div className="container mx-auto flex justify-between items-center">
             <div className="flex items-center gap-3 text-primary">
                <Sparkles className="h-8 w-8" />
                <h1 className="font-headline text-2xl font-bold">
                    Autoservicio ColGemelli
                </h1>
            </div>
            <Button asChild variant="outline">
                <Link href="/">Ir a Inicio de Sesión</Link>
            </Button>
         </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <PageHeader
            title="Portal de Autogestión"
            description="Seleccione los productos que desea comprar."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden group">
                        <div className="aspect-square relative">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            data-ai-hint={product.imageHint}
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        </div>

                        <CardContent className="p-4">
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xl font-bold">{formatCurrency(product.price)}</span>
                                <Button onClick={() => addToCart(product)}>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Agregar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            </div>

            <div>
            <Card className="bg-primary text-primary-foreground sticky top-8">
                <CardHeader>
                <CardTitle>Carrito de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-60 mb-4">
                        {cart.length === 0 ? (
                            <p className="text-center text-blue-200">El carrito está vacío</p>
                        ) : (
                            <Table>
                                <TableBody>
                                    {cart.map(item => (
                                        <TableRow key={item.id} className="border-blue-800 hover:bg-primary/90">
                                            <TableCell className="text-primary-foreground font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button size="icon" variant="outline" className="h-6 w-6 bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 text-primary-foreground" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-6 text-center">{item.quantity}</span>
                                                    <Button size="icon" variant="outline" className="h-6 w-6 bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 text-primary-foreground" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(item.price * item.quantity)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="icon" variant="ghost" className="text-red-300 hover:bg-red-500/20 hover:text-red-300" onClick={() => removeFromCart(item.id)}>
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
                        <div className="flex justify-between font-bold">
                            <span>TOTAL</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button 
                        className="w-full text-lg h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold" 
                        onClick={handlePayment}
                        disabled={cart.length === 0}
                    >
                        Pagar con DaviPlata
                    </Button>
                    <Button variant="destructive" className="w-full text-lg h-12" onClick={clearCart}>
                        Vaciar
                    </Button>
                </CardFooter>
            </Card>
            </div>
        </div>

         <div className="mt-12">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-6 w-6" />
                        Historial de Compras
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {purchaseHistory.length === 0 ? (
                        <p className="text-center text-muted-foreground">No hay compras en su historial.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código de Pago</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseHistory.map((purchase) => (
                                    <TableRow key={purchase.code}>
                                        <TableCell className="font-mono">{purchase.code}</TableCell>
                                        <TableCell>{purchase.date}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(purchase.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>

        <Dialog open={isPaymentModalOpen} onOpenChange={closeModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Código de Pago Generado</DialogTitle>
                    <DialogDescription>
                        Presente este código en la caja para completar su compra.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">Su código de pago único es:</p>
                    <div className="my-4 p-4 bg-muted rounded-md">
                        <p className="text-3xl font-bold font-mono tracking-widest text-primary">{paymentCode}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Este código es válido por 30 minutos.</p>
                </div>
                 <Button onClick={closeModal} className="w-full">Entendido</Button>
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );

    