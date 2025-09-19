
"use client";

import { useState } from 'react';
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
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product';
};

export default function SelfServicePage() {
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div>
      <PageHeader
        title="Portal de Autogestión"
        description="Seleccione los productos que desea comprar."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Product List */}
        <div className="lg:col-span-2">
            <ScrollArea className="h-[75vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-4">
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
            </ScrollArea>
        </div>

        {/* Cart and Checkout */}
        <div>
          <Card className="bg-primary text-primary-foreground sticky top-20">
            <CardHeader>
              <CardTitle>Carrito de Compras</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-80 mb-4">
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
            <CardFooter className="flex gap-2">
                 <Button className="w-full text-lg h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                    Pagar
                </Button>
                <Button variant="destructive" className="w-full text-lg h-12" onClick={clearCart}>
                    Vaciar
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
