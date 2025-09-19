
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, doc, getDoc, runTransaction, setDoc, DocumentReference } from "firebase/firestore";
import type { Purchase, NewPurchase, Product } from "@/lib/types";

// Function to get a single purchase by its ID
export async function getPurchaseById(id: string): Promise<Purchase | null> {
    const purchaseRef = doc(db, 'purchases', id);
    const purchaseSnap = await getDoc(purchaseRef);

    if (purchaseSnap.exists()) {
        return { id: purchaseSnap.id, ...purchaseSnap.data() } as Purchase;
    } else {
        return null;
    }
}


// Function to get all purchases for a given cedula from Firestore
export async function getPurchasesByCedula(cedula: string): Promise<Purchase[]> {
  const purchasesCol = collection(db, 'purchases');
  const q = query(purchasesCol, where("cedula", "==", cedula));
  const purchaseSnapshot = await getDocs(q);
  const purchaseList = purchaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
  return purchaseList;
}

// Function to get all purchases for a given celular from Firestore
export async function getPurchasesByCelular(celular: string): Promise<Purchase[]> {
  const purchasesCol = collection(db, 'purchases');
  const q = query(purchasesCol, where("celular", "==", celular));
  const purchaseSnapshot = await getDocs(q);
  const purchaseList = purchaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
  return purchaseList;
}

// Function to add a new purchase to Firestore with a custom ID and update stock
export async function addPurchase(purchase: NewPurchase): Promise<Purchase> {
  const counterRef = doc(db, "counters", "purchaseCounter");

  // Get the first letter of the first item, or 'X' if cart is empty.
  const firstItemInitial = purchase.items.length > 0 
    ? purchase.items[0].name.charAt(0).toUpperCase()
    : 'X';

  try {
    const newPurchaseId = await runTransaction(db, async (transaction) => {
      // 1. Decrement stock for each product
      for (const item of purchase.items) {
        if (item.type === 'product') {
          const productRef = doc(db, 'products', item.id);
          const productDoc = await transaction.get(productRef);
          if (!productDoc.exists()) {
            throw new Error(`Producto con ID ${item.id} no encontrado.`);
          }
          const productData = productDoc.data() as Product;
          const newStock = productData.stock - item.quantity;
          if (newStock < 0) {
            throw new Error(`Stock insuficiente para ${productData.name}.`);
          }
          transaction.update(productRef, { stock: newStock });
        }
      }

      // 2. Increment the purchase counter
      const counterDoc = await transaction.get(counterRef);
      let newCount = 1;
      if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
      }
      transaction.set(counterRef, { count: newCount }, { merge: true });

      // 3. Generate the new Purchase ID
      const formattedCount = String(newCount).padStart(4, '0');
      const generatedId = `CG${firstItemInitial}${formattedCount}`;

      // 4. Create the purchase document
      const purchaseRef = doc(db, 'purchases', generatedId);
      transaction.set(purchaseRef, purchase);

      return generatedId;
    });

    return { id: newPurchaseId, ...purchase };
  } catch (error) {
    console.error("Transaction failed: ", error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
}
