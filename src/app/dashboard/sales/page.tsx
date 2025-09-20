
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Product, Ticket, Purchase } from '@/lib/types';
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
import { formatCurrency, cn } from '@/lib/utils';
import { getProducts } from '@/lib/services/product-service';
import { addPurchase, getPurchases, type NewPurchase } from '@/lib/services/purchase-service';
import { useToast } from '@/hooks/use-toast';
import { useMockAuth } from '@/hooks/use-mock-auth';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'ticket';
  stock?: number;
};

export default function SalesPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerPayment, setCustomerPayment] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { role, users, isMounted } = useMockAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [fetchedProducts, fetchedPurchases] = await Promise.all([
            getProducts(),
            getPurchases(),
        ]);
        setProducts(fetchedProducts);
        setPurchases(fetchedPurchases);
    } catch (error) {
        console.error("Error fetching data:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos de ventas." });
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const pendingQuantities = useMemo(() => {
    const pending: { [productId: string]: number } = {};
    purchases
        .filter(p => p.status === 'pending')
        .flatMap(p => p.items)
        .forEach(item => {
            if (item.id in pending) {
                pending[item.id] += item.quantity;
            } else {
                pending[item.id] = item.quantity;
            }
        });
    return pending;
  }, [purchases]);


  const availableTickets: Ticket[] = []; // No tickets by default

  const addToCart = (item: Product | Ticket, type: 'product' | 'ticket') => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      
      if (type === 'product') {
        const product = item as Product;
        if (product.stock <= 0) {
            toast({ variant: "destructive", title: "Sin Stock", description: `${product.name} está agotado.` });
            return prevCart;
        }
         if (existingItem && existingItem.quantity >= product.stock) {
            toast({ variant: "destructive", title: "Límite de Stock", description: `No puedes agregar más ${product.name}.` });
            return prevCart;
        }
      }
      
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      const name = type === 'product' ? (item as Product).name : (item as Ticket).uniqueCode;
      const stock = type === 'product' ? (item as Product).stock : undefined;
      return [...prevCart, { id: item.id, name, name, price: item.price, quantity: 1, type, stock }];
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.id !== id);
      }

      const itemToUpdate = prevCart.find(item => item.id === id);
      if (itemToUpdate?.type === 'product' && itemToUpdate.stock !== undefined && newQuantity > itemToUpdate.stock) {
        toast({ variant: "destructive", title: "Límite de Stock", description: `Solo quedan ${itemToUpdate.stock} unidades de ${itemToUpdate.name}.` });
        return prevCart.map((item) =>
          item.id === id ? { ...item, quantity: itemToUpdate.stock } : item
        );
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

  const handlePurchase = async () => {
    if (cart.length === 0) {
        toast({ variant: "destructive", title: "Error", description: "El carrito está vacío." });
        return;
    }
    setIsProcessing(true);

    const currentUser = users.find(u => u.role === role);

    const newPurchaseData: NewPurchase = {
        date: new Date().toLocaleString('es-CO'),
        total: subtotal,
        items: cart,
        cedula: 'N/A', // Not required for POS sales
        celular: 'N/A',
        sellerId: currentUser?.id,
        sellerName: currentUser?.name,
    };

    try {
        await addPurchase(newPurchaseData);
        toast({ title: "Venta Exitosa", description: "La compra ha sido registrada." });
        clearCart();
        loadData(); // Reload data after purchase
    } catch (error) {
        console.error("Error creating purchase:", error);
        toast({ variant: "destructive", title: "Error en la Venta", description: (error as Error).message || "No se pudo registrar la venta." });
    } finally {
        setIsProcessing(false);
    }
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const change = customerPayment - subtotal;
  
  const productsForSale = products.filter(p => p.isPosAvailable);

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
                    <CardTitle>Productos y Autogestión</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh]">
                         <h3 className="text-lg font-semibold mb-2">Autogestión</h3>
                         <div className="flex flex-col gap-2 mb-4">
                            {availableTickets.length === 0 ? (
                                <p className="text-muted-foreground p-3">No hay boletos disponibles.</p>
                            ) : (
                                availableTickets.map((ticket) => (
                                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <TicketIcon className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="font-semibold">{ticket.uniqueCode}</p>
                                                <p className="text-sm text-muted-foreground">{formatCurrency(ticket.price)}</p>
                                            </div>
                                        </div>
                                        <Button onClick={() => addToCart(ticket, 'ticket')}>
                                            Agregar al carrito
                                        </Button>
                                    </div>
                                ))
                            )}
                         </div>
                         <h3 className="text-lg font-semibold mb-2">Productos</h3>
                         {isLoading ? (
                            <p className="text-muted-foreground p-3">Cargando productos...</p>
                         ) : (
                            <div className="flex flex-col gap-2">
                                {productsForSale.length === 0 ? (
                                    <p className="text-muted-foreground p-3">No hay productos disponibles para la venta.</p>
                                ) : (
                                    productsForSale.map((product) => {
                                      const isSoldOut = product.stock <= 0;
                                      return (
                                        <div key={product.id} className={cn("flex items-center justify-between p-3 bg-muted/50 rounded-lg", isSoldOut && "opacity-50")}>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-secondary rounded-md flex-shrink-0 relative">
                                                   <Image 
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{product.name}</p>
                                                    <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isSoldOut ? (
                                                    <Badge variant="destructive">Agotado</Badge>
                                                ) : (
                                                    <div className='flex items-center gap-2'>
                                                        {pendingQuantities[product.id] > 0 && (
                                                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">Pendientes: {pendingQuantities[product.id]}</Badge>
                                                        )}
                                                        <Badge variant="outline">Stock: {product.stock}</Badge>
                                                    </div>
                                                )}
                                                <Button onClick={() => addToCart(product, 'product')} disabled={isSoldOut}>
                                                    Agregar
                                                </Button>
                                            </div>
                                        </div>
                                      )
                                    })
                                )}
                            </div>
                         )}
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
                    <div className="flex justify-between font-bold">
                        <span>SUBTOTAL</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <label htmlFor="customer-payment" className="font-semibold">CLIENTE</label>
                        <Input 
                            id="customer-payment"
                            type="number"
                            className="w-32 bg-blue-900 border-blue-700 text-right font-bold text-xl"
                            placeholder="0"
                            value={customerPayment || ''}
                            onChange={(e) => setCustomerPayment(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex justify-between font-bold text-red-500">
                        <span>DEVOLUCIÓN</span>
                        <span>{formatCurrency(change > 0 && customerPayment > subtotal ? change : 0)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                 <Button 
                    className="w-full text-lg h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    onClick={handlePurchase}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Procesando...' : 'Comprar'}
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
