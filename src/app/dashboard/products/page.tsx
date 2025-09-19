
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { PlusCircle, MoreHorizontal, Database, Trash2, Pencil } from "lucide-react";
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
import { getProducts, addProduct, addProductWithId, type NewProduct, updateProduct } from "@/lib/services/product-service";
import { useToast } from "@/hooks/use-toast";

function ProductForm({ 
    mode, 
    initialData,
    onProductAdded,
    onProductUpdated,
}: { 
    mode: 'create' | 'edit';
    initialData?: Product;
    onProductAdded: (product: Product) => void;
    onProductUpdated: (product: Product) => void;
}) {
    const { toast } = useToast();
    const [name, setName] = useState(initialData?.name || '');
    const [price, setPrice] = useState(initialData?.price.toString() || '');
    const [stock, setStock] = useState(initialData?.stock.toString() || '');
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData) {
            setName(initialData.name);
            setPrice(initialData.price.toString());
            setStock(initialData.stock.toString());
            setImageUrl(initialData.imageUrl);
        } else if (isOpen && mode === 'create') {
            setName('');
            setPrice('');
            setStock('');
            setImageUrl('');
        }
    }, [isOpen, mode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'create') {
            const newProductData: NewProduct = {
                name,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                imageUrl: imageUrl || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/400/400`,
                imageHint: name.toLowerCase().split(' ').slice(0,2).join(' ')
            };

            try {
                const addedProduct = await addProduct(newProductData);
                onProductAdded(addedProduct);
                toast({ title: "Éxito", description: "Producto añadido correctamente." });
                setIsOpen(false);
            } catch (error) {
                console.error("Error adding product:", error);
                toast({ variant: "destructive", title: "Error", description: "No se pudo añadir el producto." });
            }
        } else if (mode === 'edit' && initialData) {
             const updatedProductData = {
                name,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                imageUrl,
                imageHint: name.toLowerCase().split(' ').slice(0,2).join(' ')
            };
            try {
                await updateProduct(initialData.id, updatedProductData);
                onProductUpdated({ ...initialData, ...updatedProductData });
                toast({ title: "Éxito", description: "Producto actualizado correctamente." });
                setIsOpen(false);
            } catch (error) {
                console.error("Error updating product:", error);
                toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el producto." });
            }
        }
    };

    const dialogTitle = mode === 'create' ? "Añadir Nuevo Producto" : "Editar Producto";
    const dialogDescription = mode === 'create' ? "Complete los detalles del nuevo producto." : "Actualice los detalles del producto.";
    const buttonText = mode === 'create' ? "Guardar Producto" : "Guardar Cambios";

    const trigger = mode === 'create' ? (
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Producto
        </Button>
    ) : (
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
        </DropdownMenuItem>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>
                <form id={`product-form-${initialData?.id || 'create'}`} onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="product-name">Nombre del Producto</Label>
                            <Input id="product-name" placeholder="Ej: Carne Asada" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-price">Precio</Label>
                            <Input id="product-price" type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-stock">Stock Inicial</Label>
                            <Input id="product-stock" type="number" placeholder="100" value={stock} onChange={e => setStock(e.target.value)} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-image-url">URL de la Imagen</Label>
                            <Input id="product-image-url" placeholder="https://ejemplo.com/imagen.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button type="submit" form={`product-form-${initialData?.id || 'create'}`}>{buttonText}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeeded, setHasSeeded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProducts() {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        if (fetchedProducts.length > 0) {
            setHasSeeded(true);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los productos." });
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [toast]);

  const handleProductAdded = (newProduct: Product) => {
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };


  const handleSeedDatabase = async () => {
    try {
        await Promise.all(mockProducts.map(p => addProductWithId(p)));
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setHasSeeded(true);
        toast({ title: "Éxito", description: "La base de datos ha sido inicializada con productos de ejemplo." });
    } catch (error) {
        console.error("Error seeding database:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo inicializar la base de datos." });
    }
  };

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Gestionar el inventario de productos para la venta."
      >
        <RoleGate allowedRoles={['admin', 'cashier']}>
           {!hasSeeded && (
            <Button variant="outline" onClick={handleSeedDatabase}>
                <Database className="mr-2 h-4 w-4" />
                Cargar Productos de Ejemplo
            </Button>
           )}
           <ProductForm mode="create" onProductAdded={handleProductAdded} onProductUpdated={handleProductUpdated} />
        </RoleGate>
      </PageHeader>
      
      {isLoading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
            <Card key={product.id} className="overflow-hidden relative group">
                <RoleGate allowedRoles={['admin', 'cashier']}>
                    <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <ProductForm 
                                    mode="edit" 
                                    initialData={product}
                                    onProductAdded={handleProductAdded}
                                    onProductUpdated={handleProductUpdated}
                                />
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
      )}
    </div>
  );
}
