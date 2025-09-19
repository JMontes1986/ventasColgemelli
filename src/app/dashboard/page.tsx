
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { DollarSign, Users, ShoppingCart, UserCog, RefreshCw, Download, Undo2, ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Purchase, Product, Return } from "@/lib/types";
import { getPurchases } from "@/lib/services/purchase-service";
import { getProducts } from "@/lib/services/product-service";
import { getReturns } from "@/lib/services/return-service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const statusTranslations: Record<Purchase['status'], string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

const statusColors: Record<Purchase['status'], string> = {
    pending: 'bg-yellow-500/20 text-yellow-700',
    paid: 'bg-green-500/20 text-green-700',
    delivered: 'bg-blue-500/20 text-blue-700',
    cancelled: 'bg-red-500/20 text-red-700',
};

type ProductSales = {
    [productId: string]: {
        name: string;
        grossQuantity: number;
        grossRevenue: number;
        returnedQuantity: number;
        returnedRevenue: number;
        netQuantity: number;
        netRevenue: number;
    }
}

export default function Dashboard() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedPurchases, fetchedProducts, fetchedReturns] = await Promise.all([
        getPurchases(),
        getProducts(),
        getReturns(),
      ]);
      setPurchases(fetchedPurchases);
      setProducts(fetchedProducts);
      setReturns(fetchedReturns);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos del panel." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const paidPurchases = purchases.filter((p) => p.status === "paid" || p.status === "delivered");
  const totalRevenue = paidPurchases.reduce((sum, p) => sum + p.total, 0);
  
  const selfServicePurchases = paidPurchases.filter(p => !p.sellerId);

  const selfServiceRevenue = selfServicePurchases.reduce((sum, p) => sum + p.total, 0);

  const selfServiceUsers = new Set(selfServicePurchases.map(p => p.cedula)).size;

  const activeSellers = new Set(paidPurchases.map(p => p.sellerId).filter(Boolean)).size;
  
  const totalReturnedItems = returns.reduce((sum, r) => sum + r.quantity, 0);

    const productSales = paidPurchases
        .flatMap(p => p.items)
        .reduce((acc, item) => {
            if (!acc[item.id]) {
                const product = products.find(p => p.id === item.id);
                acc[item.id] = { 
                    name: product?.name || item.name, 
                    grossQuantity: 0, 
                    grossRevenue: 0,
                    returnedQuantity: 0,
                    returnedRevenue: 0,
                    netQuantity: 0,
                    netRevenue: 0,
                };
            }
            acc[item.id].grossQuantity += item.quantity;
            acc[item.id].grossRevenue += item.price * item.quantity;
            return acc;
        }, {} as ProductSales);

    returns.forEach(returnedItem => {
        if (productSales[returnedItem.productId]) {
            const product = products.find(p => p.id === returnedItem.productId);
            const pricePerItem = product ? product.price : 0;
            productSales[returnedItem.productId].returnedQuantity += returnedItem.quantity;
            productSales[returnedItem.productId].returnedRevenue += returnedItem.quantity * pricePerItem;
        }
    });

    Object.values(productSales).forEach(data => {
        data.netQuantity = data.grossQuantity - data.returnedQuantity;
        data.netRevenue = data.grossRevenue - data.returnedRevenue;
    });


  const sortedProductSales = Object.entries(productSales).sort(([,a],[,b]) => b.netRevenue - a.netRevenue);

  const handleExportCSV = () => {
    if (sortedProductSales.length === 0) {
        toast({
            variant: "destructive",
            title: "No hay datos",
            description: "No hay datos de ventas por producto para exportar."
        });
        return;
    }

    const headers = ["Producto", "Cantidad Vendida (Neta)", "Ingresos (COP)"];
    const rows = sortedProductSales.map(([, data]) => [
        `"${data.name.replace(/"/g, '""')}"`,
        data.netQuantity,
        data.netRevenue
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ventas_por_producto.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
};


  return (
    <div>
      <PageHeader
        title="Panel de Control"
        description="Un resumen de las ventas y la actividad de los boletos."
      >
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Basado en todas las compras pagadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Autogestión</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(selfServiceRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Ventas del portal de autogestión
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Autogestión</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{selfServiceUsers}</div>
            <p className="text-xs text-muted-foreground">
              Clientes únicos de autogestión
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendedores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeSellers}</div>
            <p className="text-xs text-muted-foreground">
              Vendedores con transacciones
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artículos Vendidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{paidPurchases.flatMap(p => p.items).reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de artículos en compras pagadas
            </p>
          </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Artículos Devueltos</CardTitle>
                <Undo2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                +{totalReturnedItems}
                </div>
                <p className="text-xs text-muted-foreground">
                Total de artículos devueltos al stock
                </p>
            </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
            <CardHeader className="flex items-center justify-between flex-row">
                <div>
                    <CardTitle>Rendimiento por Producto</CardTitle>
                    <CardDescription>
                    Desglose de ventas, devoluciones e ingresos netos para cada producto.
                    </CardDescription>
                </div>
                <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a CSV
                </Button>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="h-24 text-center flex items-center justify-center">Calculando ventas...</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {sortedProductSales.map(([productId, data]) => (
                            <Card key={productId}>
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base font-medium">{data.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-2 text-sm">
                                    <div className="flex justify-between items-center text-green-600">
                                       <span className="flex items-center"><ArrowUp className="mr-1 h-4 w-4" /> Ventas Brutas</span>
                                       <span>{data.grossQuantity} / {formatCurrency(data.grossRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-red-600">
                                        <span className="flex items-center"><ArrowDown className="mr-1 h-4 w-4" /> Devoluciones</span>
                                        <span>{data.returnedQuantity}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
                                       <span>Total Neto</span>
                                       <span>{formatCurrency(data.netRevenue)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                 )}
            </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>
              Una lista de las transacciones de venta más recientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="h-24 text-center flex items-center justify-center">Cargando ventas...</div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>ID de Compra</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vendedor/Cliente</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No hay ventas recientes.
                            </TableCell>
                        </TableRow>
                    ) : (
                        purchases.slice(0, 5).map((purchase) => (
                        <TableRow key={purchase.id}>
                            <TableCell className="font-medium font-mono">{purchase.id}</TableCell>
                            <TableCell>
                            <Badge
                                variant="outline"
                                className={`capitalize ${statusColors[purchase.status]}`}
                            >
                                {statusTranslations[purchase.status]}
                            </Badge>
                            </TableCell>
                            <TableCell>{purchase.sellerName || purchase.cedula}</TableCell>
                            <TableCell className="text-right">
                            {formatCurrency(purchase.total)}
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    

    