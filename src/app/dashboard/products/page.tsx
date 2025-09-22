
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Database, Trash2, Pencil, ShoppingCart, Store, Plus, PackagePlus } from "lucide-react";
import { PermissionGate } from "@/components/permission-gate";
import Image from "next/image";
import { mockProducts } from "@/lib/placeholder-data";
import type { Product, User } from "@/lib/types";
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
import { formatCurrency, cn } from "@/lib/utils";
import { getProducts, addProduct, addProductWithId, type NewProduct, updateProduct, increaseProductStock } from "@/lib/services/product-service";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useMockAuth } from "@/hooks/use-mock-auth";

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
    const [isSelfService, setIsSelfService] = useState(initialData?.isSelfService || false);
    const [isPosAvailable, setIsPosAvailable] = useState(initialData?.isPosAvailable ?? true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setName(initialData.name);
            setPrice(initialData.price.toString());
            setStock(initialData.stock.toString());
            setImageUrl(initialData.imageUrl);
            setIsSelfService(initialData.isSelfService);
            setIsPosAvailable(initialData.isPosAvailable ?? true);
        }
    }, [initialData, mode]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset form when closing if it's in create mode
             if (mode === 'create') {
                setName('');
                setPrice('');
                setStock('');
                setImageUrl('');
                setIsSelfService(false);
                setIsPosAvailable(true);
            }
        } else {
             if (mode === 'edit' && initialData) {
                setName(initialData.name);
                setPrice(initialData.price.toString());
                setStock(initialData.stock.toString());
                setImageUrl(initialData.imageUrl);
                setIsSelfService(initialData.isSelfService);
                setIsPosAvailable(initialData.isPosAvailable ?? true);
            } else {
                setName('');
                setPrice('');
                setStock('');
                setImageUrl('');
                setIsSelfService(false);
                setIsPosAvailable(true);
            }
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'create') {
            const newProductData: NewProduct = {
                name,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                imageUrl: imageUrl || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/400/400`,
                imageHint: name.toLowerCase().split(' ').slice(0,2).join(' '),
                isSelfService,
                isPosAvailable,
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
                imageHint: name.toLowerCase().split(' ').slice(0,2).join(' '),
                isSelfService,
                isPosAvailable,
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
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                        <div className="space-y-2">
                            <Label>Disponibilidad</Label>
                            <div className="flex items-center space-x-2">
                                <Switch id="is-pos-available" checked={isPosAvailable} onCheckedChange={setIsPosAvailable} />
                                <Label htmlFor="is-pos-available">Punto de Venta (Caja)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="is-self-service" checked={isSelfService} onCheckedChange={setIsSelfService} />
                                <Label htmlFor="is-self-service">Autoservicio</Label>
                            </div>
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

function RestockForm({ product, onStockUpdated }: { product: Product; onStockUpdated: (product: Product) => void; }) {
    const { toast } = useToast();
    const { currentUser } = useMockAuth();
    const [quantity, setQuantity] = useState(1);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setQuantity(1);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentUser) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo identificar al usuario actual." });
            return;
        }

        if (quantity <= 0) {
            toast({ variant: "destructive", title: "Cantidad Inválida", description: "La cantidad a añadir debe ser mayor que cero." });
            return;
        }

        try {
            await increaseProductStock(product.id, quantity, currentUser);
            const updatedProduct = { 
                ...product, 
                stock: product.stock + quantity,
                restockCount: (product.restockCount || 0) + 1,
            };
            onStockUpdated(updatedProduct);
            toast({ title: "Éxito", description: `Se añadieron ${quantity} unidades al stock de ${product.name}.` });
            setIsOpen(false);
        } catch (error) {
            console.error("Error restocking product:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el stock." });
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Stock
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Añadir Stock para: {product.name}</DialogTitle>
                    <DialogDescription>
                        Esta acción incrementará el stock actual del producto. Quedará registrada en la auditoría como un reintegro.
                    </DialogDescription>
                </DialogHeader>
                <form id={`restock-form-${product.id}`} onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <p className="text-sm">Stock Actual: <span className="font-bold">{product.stock}</span></p>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="quantity-to-add">Cantidad a Añadir</Label>
                            <Input 
                                id="quantity-to-add" 
                                type="number" 
                                value={quantity} 
                                onChange={e => setQuantity(Number(e.target.value))} 
                                min="1"
                                required 
                            />
                        </div>
                        <div className="text-sm font-semibold">
                            <p>Nuevo Stock Total: {product.stock + quantity}</p>
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" form={`restock-form-${product.id}`}>Confirmar Reintegro</Button>
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
      setIsLoading(true);
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
  }, []);

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
        <PermissionGate requiredPermission="products">
           {!hasSeeded && (
            <Button variant="outline" onClick={handleSeedDatabase}>
                <Database className="mr-2 h-4 w-4" />
                Cargar Productos de Ejemplo
            </Button>
           )}
           <ProductForm mode="create" onProductAdded={handleProductAdded} onProductUpdated={handleProductUpdated} />
        </PermissionGate>
      </PageHeader>
      
      {isLoading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
            <Card 
                key={product.id} 
                className={cn(
                    "overflow-hidden relative group",
                    product.stock <= 0 && "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800"
                )}
            >
                <PermissionGate requiredPermission="products">
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
                                <RestockForm product={product} onStockUpdated={handleProductUpdated} />
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </PermissionGate>
                <div className="relative flex justify-center pt-4">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="object-cover rounded-md transition-transform group-hover:scale-105"
                        data-ai-hint={product.imageHint}
                    />
                </div>

                <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <div className="flex flex-col items-end gap-1">
                            {product.isPosAvailable && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Store className="h-3 w-3" />
                                    <span>Caja</span>
                                </Badge>
                            )}
                            {product.isSelfService && (
                                <Badge variant="outline" className="flex items-center gap-1 border-blue-300 text-blue-700">
                                     <ShoppingCart className="h-3 w-3" />
                                    <span>Autoservicio</span>
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xl font-bold">{formatCurrency(product.price)}</span>
                        <span className="text-sm font-medium text-muted-foreground">
                        Stock: {product.stock}
                        </span>
                    </div>
                     <div className="flex justify-start items-center mt-2">
                         <Badge variant="outline" className="flex items-center gap-1">
                            <PackagePlus className="h-3 w-3" />
                            <span>Reintegros: {product.restockCount || 0}</span>
                        </Badge>
                    </div>
                </CardContent>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}

    