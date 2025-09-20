
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, setDoc, updateDoc, query, where, runTransaction, increment } from "firebase/firestore";
import type { Product } from "@/lib/types";

// Type for creating a new product, ID is optional as Firestore will generate it
export type NewProduct = Omit<Product, 'id'>;
export type UpdatableProduct = Partial<NewProduct>;

// Function to get all products from Firestore
export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isPosAvailable: doc.data().isPosAvailable ?? true } as Product));
  return productList;
}

// Function to get only products marked for self-service
export async function getSelfServiceProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  // Query for products that are marked for self-service
  const q = query(
    productsCol, 
    where("isSelfService", "==", true)
  );
  const productSnapshot = await getDocs(q);
  const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  return productList;
}

// Function to add a new product to Firestore
export async function addProduct(product: NewProduct): Promise<Product> {
  const productsCol = collection(db, 'products');
  const docRef = await addDoc(productsCol, product);
  return { id: docRef.id, ...product };
}

// Function to add a product with a specific ID (for seeding)
export async function addProductWithId(product: Product): Promise<void> {
    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, {
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        imageHint: product.imageHint,
        isSelfService: product.isSelfService ?? false,
        isPosAvailable: product.isPosAvailable ?? true,
    });
}

// Function to update an existing product in Firestore
export async function updateProduct(productId: string, product: UpdatableProduct): Promise<void> {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, product);
}

// Function to increase the stock of a product (for returns)
export async function increaseProductStock(productId: string, quantity: number): Promise<void> {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
        stock: increment(quantity)
    });
}
