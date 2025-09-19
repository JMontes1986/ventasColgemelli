
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
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
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { RoleGate } from "@/components/role-gate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockProducts = [
    { id: 'prod-1', name: 'Gaseosa', price: 2.50, stock: 120, category: 'Bebidas' },
    { id: 'prod-2', name: 'Paquete de Papas', price: 1.75, stock: 80, category: 'Snacks' },
    { id: 'prod-3', name: 'Galletas', price: 1.25, stock: 200, category: 'Snacks' },
    { id: 'prod-4', name: 'Botella de Agua', price: 1.00, stock: 150, category: 'Bebidas' },
    { id: 'prod-5', name: 'Sándwich', price: 4.50, stock: 45, category: 'Comida' },
]


export default function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Productos"
        description="Gestionar el inventario de productos para la venta."
      >
        <RoleGate allowedRoles={['admin']}>
            <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Producto
            </Button>
        </RoleGate>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
          <CardDescription>
            Una lista de todos los productos disponibles para la venta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                   <TableCell>{product.stock}</TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
