
"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Upload, Trash2, Pencil } from "lucide-react";
import { RoleGate } from "@/components/role-gate";
import Image from "next/image";
import { mockProducts } from "@/lib/placeholder-data";
import type { Product } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

function CreateProductForm() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Producto</DialogTitle>
                    <DialogDescription>
                        Complete los detalles del nuevo producto.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="product-name">Nombre del Producto</Label>
                        <Input id="product-name" placeholder="Ej: Carne Asada" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product-price">Precio</Label>
                        <Input id="product-price" type="number" placeholder="0.00" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="product-stock">Stock Inicial</Label>
                        <Input id="product-stock" type="number" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product-category">Categoría</Label>
                        <Input id="product-category" placeholder="Ej: Comida Principal" />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="product-image">Imagen del Producto</Label>
                        <div className="flex items-center gap-2">
                            <Input id="product-image" type="file" className="flex-1" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button type="submit">Guardar Producto</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Gestionar el inventario de productos para la venta."
      >
        <RoleGate allowedRoles={['admin']}>
           <CreateProductForm />
        </RoleGate>
      </PageHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden relative group">
            <RoleGate allowedRoles={['admin']}>
                 <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </RoleGate>
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
                <span className="text-sm font-medium text-muted-foreground">
                  Stock: {product.stock}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
