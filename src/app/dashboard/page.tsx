
"use client";

import { useState, useEffect } from "react";
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
import { Ticket, DollarSign, Users, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Purchase } from "@/lib/types";
import { getPurchases } from "@/lib/services/purchase-service";
import { useToast } from "@/hooks/use-toast";

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

export default function Dashboard() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadPurchases() {
      setIsLoading(true);
      try {
        const fetchedPurchases = await getPurchases();
        setPurchases(fetchedPurchases);
      } catch (error) {
        console.error("Error fetching purchases:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las compras." });
      } finally {
        setIsLoading(false);
      }
    }
    loadPurchases();
  }, []);

  const paidPurchases = purchases.filter((p) => p.status === "paid" || p.status === "delivered");
  const totalRevenue = paidPurchases.reduce((sum, p) => sum + p.total, 0);
  const ticketsSold = purchases
    .flatMap(p => p.items)
    .filter(item => item.name.startsWith('CG')) // A simple way to identify tickets
    .reduce((sum, item) => sum + item.quantity, 0);

  const activeUsers = new Set(purchases.map(p => p.sellerId).filter(Boolean)).size;

  return (
    <div>
      <PageHeader
        title="Panel de Control"
        description="Un resumen de las ventas y la actividad de los boletos."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Artículos Vendidos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{purchases.flatMap(p => p.items).reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de artículos en compras
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendedores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Vendedores con transacciones registradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Entrega</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (purchases.filter((p) => p.status === "delivered").length /
                  (paidPurchases.length || 1)) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              De todas las compras pagadas
            </p>
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
