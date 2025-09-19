
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
import { DollarSign, Users, ShoppingCart, UserCog, RefreshCw, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Purchase, Product } from "@/lib/types";
import { getPurchases } from "@/lib/services/purchase-service";
import { getProducts } from "@/lib/services/product-service";
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
        quantity: number;
        revenue: number;
    }
}

export default function Dashboard() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedPurchases, fetchedProducts] = await Promise.all([
        getPurchases(),
        getProducts(),
      ]);
      setPurchases(fetchedPurchases);
      setProducts(fetchedProducts);
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

  const productSales = paidPurchases
    .flatMap(p => p.items)
    .reduce((acc, item) => {
        if (!acc[item.id]) {
            const product = products.find(p => p.id === item.id);
            acc[item.id] = { name: product?.name || item.name, quantity: 0, revenue: 0 };
        }
        acc[item.id].quantity += item.quantity;
        acc[item.id].revenue += item.price * item.quantity;
        return acc;
    }, {} as ProductSales);

  const sortedProductSales = Object.entries(productSales).sort(([,a],[,b]) => b.revenue - a.revenue);

  const handleExportCSV = () => {
    if (sortedProductSales.length === 0) {
        toast({
            variant: "destructive",
            title: "No hay datos",
            description: "No hay datos de ventas por producto para exportar."
        });
        return;
    }

    const headers = ["Producto", "Cantidad Vendida", "Ingresos (COP)"];
    const rows = sortedProductSales.map(([, data]) => [
        `"${data.name.replace(/"/g, '""')}"`, // Escape double quotes
        data.quantity,
        data.revenue
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
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
      </div>

      <div className="mt-8">
        <Card>
            <CardHeader className="flex items-center justify-between flex-row">
                <div>
                    <CardTitle>Ventas por Producto</CardTitle>
                    <CardDescription>
                    Ingresos y unidades vendidas para cada producto.
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
                                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">{data.name}</CardTitle>
                                    <span className="text-sm font-normal text-muted-foreground">+{data.quantity} unidades</span>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-2xl font-bold">{formatCurrency(data.revenue)}</div>
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
