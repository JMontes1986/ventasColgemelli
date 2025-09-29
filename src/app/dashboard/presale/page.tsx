
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Minus, Search, ExternalLink, Printer } from "lucide-react";
import { formatCurrency, cn } from '@/lib/utils';
import { getProducts } from '@/lib/services/product-service';
import { addPreSalePurchase, getPurchasesByCedula, getPurchases, type NewPurchase } from '@/lib/services/purchase-service';
import { useToast } from '@/hooks/use-toast';
import { useMockAuth } from '@/hooks/use-mock-auth';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { sendWhatsAppNotification } from '@/app/actions';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
};

const statusTranslations: Record<Purchase['status'], string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    'pre-sale': 'Preventa Pendiente',
    'pre-sale-confirmed': 'Preventa Confirmada',
};

export default function PreSalePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [customerCelular, setCustomerCelular] = useState('');
  const { toast } = useToast();
  const { currentUser } = useMockAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // For confirmation dialog
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<Purchase | null>(null);
  const confirmationDialogRef = useRef<HTMLDivElement>(null);

  // For history/search
  const [recentPreSales, setRecentPreSales] = useState<Purchase[]>([]);
  const [searchCedula, setSearchCedula] = useState('');
  const [searchResults, setSearchResults] = useState<Purchase[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [fetchedProducts, allPurchases] = await Promise.all([
          getProducts(),
          getPurchases()
        ]);
        setProducts(fetchedProducts);
        const presales = allPurchases
          .filter(p => p.status === 'pre-sale' || p.status === 'pre-sale-confirmed')
          .slice(0, 5);
        setRecentPreSales(presales);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    setCustomerCelular('');
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
     if (!customerCelular) {
        toast({ variant: "destructive", title: "Error", description: "Debe ingresar el número de celular del cliente." });
        return;
    }
    setIsProcessing(true);

    const newPreSaleData: NewPurchase = {
        date: new Date().toLocaleString('es-CO'),
        total: subtotal,
        items: cart.map(({ stock, ...item }) => item),
        cedula: customerIdentifier,
        celular: customerCelular,
        sellerId: currentUser?.id,
        sellerName: currentUser?.name,
        status: 'pre-sale',
    };

    try {
        const addedPurchase = await addPreSalePurchase(newPreSaleData);
        setLastPurchase(addedPurchase);
        setIsConfirmationOpen(true);
        toast({ title: "Preventa Exitosa", description: "La preventa ha sido registrada correctamente." });
        
        // Send WhatsApp notification in the background
        sendWhatsAppNotification(addedPurchase, customerCelular).then(success => {
            if (success) {
                toast({ title: "Notificación Enviada", description: "Se envió el comprobante por WhatsApp al cliente." });
            } else {
                 toast({ variant: "destructive", title: "Error de Notificación", description: "No se pudo enviar el comprobante por WhatsApp. Verifique las credenciales y el formato del número." });
            }
        });

        clearCart();
        loadData(); // Refresh recent presales
    } catch (error) {
        console.error("Error creating pre-sale:", error);
        toast({ variant: "destructive", title: "Error en la Preventa", description: (error as Error).message || "No se pudo registrar la preventa." });
    } finally {
        setIsProcessing(false);
    }
  }

  const handleSearchHistory = async () => {
    if (!searchCedula) {
        toast({ variant: "destructive", title: "Error", description: "Por favor, ingrese una cédula o código para buscar." });
        return;
    }
    setIsHistoryLoading(true);
    try {
        const history = await getPurchasesByCedula(searchCedula);
        setSearchResults(history.filter(p => p.status.startsWith('pre-sale')));
    } catch (error) {
        console.error("Error fetching purchase history:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar el historial de preventas." });
    } finally {
        setIsHistoryLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const displayHistory = searchResults.length > 0 ? searchResults : recentPreSales;

  return (
    <div>
      <PageHeader
        title="Registro de Preventa"
        description="Registre ventas que no dependen del stock inicial para planificar el inventario."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1">
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
        </div>

        <div className="lg:col-span-1">
            <div className="lg:sticky top-20 z-10">
                <Card className="bg-blue-950 text-white">
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
                            <div className="space-y-2">
                                <Label htmlFor="customer-celular" className="text-white">Celular (para WhatsApp)</Label>
                                <Input 
                                    id="customer-celular"
                                    value={customerCelular}
                                    onChange={(e) => setCustomerCelular(e.target.value)}
                                    className="bg-blue-900 border-blue-700 text-white"
                                    placeholder="Ej: 3001234567"
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
        
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Consultar Preventas</CardTitle>
                    <CardDescription>Busque por cédula o vea las preventas más recientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <Input 
                            placeholder="Buscar por cédula..."
                            value={searchCedula}
                            onChange={e => setSearchCedula(e.target.value)}
                        />
                        <Button onClick={handleSearchHistory} disabled={isHistoryLoading}>
                            <Search className="mr-2 h-4 w-4" />
                            {isHistoryLoading ? 'Buscando...' : 'Buscar'}
                        </Button>
                    </div>
                    <ScrollArea className="h-[60vh]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading || isHistoryLoading ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">Cargando...</TableCell></TableRow>
                                ) : displayHistory.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No se encontraron preventas.</TableCell></TableRow>
                                ) : (
                                    displayHistory.map(ps => (
                                        <TableRow key={ps.id}>
                                            <TableCell className="font-mono">{ps.id}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(ps.status === 'pre-sale' ? 'text-purple-700 border-purple-300' : 'text-teal-700 border-teal-300')}>{statusTranslations[ps.status]}</Badge>
                                            </TableCell>
                                            <TableCell>{formatCurrency(ps.total)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/dashboard/redeem?code=${ps.id}`}>
                                                        Ver / Gestionar <ExternalLink className="ml-2 h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="printable-area">
            <div ref={confirmationDialogRef}>
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <Logo className="h-auto w-48" />
                    </div>
                    <DialogTitle className="text-center text-2xl">¡Preventa Registrada!</DialogTitle>
                    <CardDescription className="text-center">Entregue este comprobante al padre de familia para confirmar y pagar la preventa en caja.</CardDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Código de Preventa Único:</p>
                        <div className="my-2 p-4 bg-muted rounded-md">
                        <p className="text-2xl sm:text-3xl font-bold font-mono tracking-widest text-primary">{lastPurchase?.id}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-center">Resumen de la Compra</h4>
                        <ul className="text-sm space-y-1">
                            {lastPurchase?.items.map(item => (
                                <li key={item.id} className="flex justify-between">
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                            <span>Total:</span>
                            <span>{formatCurrency(lastPurchase?.total ?? 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter className="print-hide">
                <Button onClick={handlePrint} variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Comprobante
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
