
"use client";

import { useState } from 'react';
import type { Product, Ticket } from '@/lib/types';
import { mockProducts, mockTickets } from '@/lib/placeholder-data';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Minus, Ticket as TicketIcon } from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'ticket';
};

export default function SalesPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerPayment, setCustomerPayment] = useState<number>(0);

  const availableTickets = mockTickets.filter(t => t.status === 'available');

  const addToCart = (item: Product | Ticket, type: 'product' | 'ticket') => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      const name = type === 'product' ? (item as Product).name : (item as Ticket).uniqueCode;
      return [...prevCart, { id: item.id, name, price: item.price, quantity: 1, type }];
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
    setCustomerPayment(0);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const change = customerPayment - subtotal;

  return (
    <div>
      <PageHeader
        title="Punto de Venta"
        description="Seleccione productos y registre una nueva venta."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Product and Ticket List */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Productos y Boletos</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh]">
                         <h3 className="text-lg font-semibold mb-2">Boletos</h3>
                         <div className="flex flex-col gap-2 mb-4">
                            {availableTickets.map((ticket) => (
                                <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <TicketIcon className="h-6 w-6 text-primary" />
                                        <div>
                                            <p className="font-semibold">{ticket.uniqueCode}</p>
                                            <p className="text-sm text-muted-foreground">${ticket.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => addToCart(ticket, 'ticket')}>
                                        Agregar al carrito
                                    </Button>
                                </div>
                            ))}
                         </div>
                         <h3 className="text-lg font-semibold mb-2">Productos</h3>
                         <div className="flex flex-col gap-2">
                            {mockProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                     <div className="flex items-center gap-3">
                                        {/* Placeholder for product image */}
                                        <div className="h-10 w-10 bg-secondary rounded-md flex-shrink-0"></div>
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => addToCart(product, 'product')}>
                                        Agregar al carrito
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        {/* Cart and Checkout */}
        <div>
          <Card className="bg-blue-950 text-white sticky top-20">
            <CardHeader>
              <CardTitle>Carrito de Compras</CardTitle>
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
                                                <span className="w-6 text-center">{item.quantity}</span>
                                                <Button size="icon" variant="outline" className="h-6 w-6 bg-blue-800 border-blue-700 hover:bg-blue-700" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-green-400 font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
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
                    <div className="flex justify-between font-bold">
                        <span>SUBTOTAL</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <label htmlFor="customer-payment" className="font-semibold">CLIENTE</label>
                        <Input 
                            id="customer-payment"
                            type="number"
                            className="w-32 bg-blue-900 border-blue-700 text-right font-bold text-xl"
                            placeholder="0.00"
                            value={customerPayment || ''}
                            onChange={(e) => setCustomerPayment(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex justify-between font-bold text-red-500">
                        <span>DEVOLUCIÓN</span>
                        <span>${change > 0 && customerPayment > subtotal ? change.toFixed(2) : (0).toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                 <Button className="w-full text-lg h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                    Comprar
                </Button>
                <Button variant="destructive" className="w-full text-lg h-12" onClick={clearCart}>
                    Borrar Todo
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
