

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, doc, getDoc, runTransaction, setDoc, DocumentReference, updateDoc, orderBy, limit } from "firebase/firestore";
import type { Purchase, NewPurchase, Product, PurchaseStatus } from "@/lib/types";

// Function to get all purchases, ordered by date
export async function getPurchases(): Promise<Purchase[]> {
  const purchasesCol = collection(db, 'purchases');
  const q = query(purchasesCol, orderBy("date", "desc"));
  const purchaseSnapshot = await getDocs(q);
  const purchaseList = purchaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
  return purchaseList;
}

// Function to get a single purchase by its ID
export async function getPurchaseById(id: string): Promise<Purchase | null> {
    const purchaseRef = doc(db, 'purchases', id);
    const purchaseSnap = await getDoc(purchaseRef);

    if (purchaseSnap.exists()) {
        // Ensure all items have a 'returned' property for consistency
        const data = purchaseSnap.data();
        const items = data.items.map((item: any) => ({ ...item, returned: item.returned || false }));
        return { id: purchaseSnap.id, ...data, items } as Purchase;
    } else {
        return null;
    }
}


// Function to get all purchases for a given cedula from Firestore
export async function getPurchasesByCedula(cedula: string): Promise<Purchase[]> {
  const purchasesCol = collection(db, 'purchases');
  const q = query(purchasesCol, where("cedula", "==", cedula), orderBy("date", "desc"));
  const purchaseSnapshot = await getDocs(q);
  const purchaseList = purchaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
  return purchaseList;
}

// Function to get all purchases for a given celular from Firestore
export async function getPurchasesByCelular(celular: string): Promise<Purchase[]> {
  const purchasesCol = collection(db, 'purchases');
  const q = query(purchasesCol, where("celular", "==", celular), orderBy("date", "desc"));
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
      // --- ALL READS MUST COME BEFORE ALL WRITES ---

      // 1. READ phase: Read all necessary documents first.
      const productDocs = await Promise.all(
        purchase.items
          .filter(item => item.type === 'product')
          .map(item => transaction.get(doc(db, 'products', item.id)))
      );
      
      const counterDoc = await transaction.get(counterRef);

      // --- VALIDATION AND PREPARATION phase ---

      // Validate products and prepare stock updates
      const stockUpdates: { ref: DocumentReference, newStock: number }[] = [];
      for (let i = 0; i < productDocs.length; i++) {
        const productDoc = productDocs[i];
        const item = purchase.items.filter(item => item.type === 'product')[i];
        
        if (!productDoc.exists()) {
          throw new Error(`Producto con ID ${item.id} no encontrado.`);
        }
        
        const productData = productDoc.data() as Product;
        const newStock = productData.stock - item.quantity;

        if (newStock < 0) {
          throw new Error(`Stock insuficiente para ${productData.name}.`);
        }
        
        stockUpdates.push({ ref: productDoc.ref, newStock });
      }

      // Prepare counter update
      let newCount = 1;
      if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
      }
      
      // Generate the new Purchase ID
      const formattedCount = String(newCount).padStart(4, '0');
      const generatedId = `CG${firstItemInitial}${formattedCount}`;

      // --- ALL WRITES HAPPEN HERE ---

      // 2. WRITE phase: Commit all changes to the database.

      // Update stock for each product
      stockUpdates.forEach(update => {
        transaction.update(update.ref, { stock: update.newStock });
      });

      // Update the purchase counter
      transaction.set(counterRef, { count: newCount }, { merge: true });

      // Create the new purchase document
      const purchaseRef = doc(db, 'purchases', generatedId);
      // Ensure all items have the 'returned' flag set to false initially
      const itemsToSave = purchase.items.map(({ type, ...item}) => ({...item, returned: false }));
      
      // If purchase comes from POS (sellerId is present), status is 'paid'. Otherwise, 'pending'.
      const status: PurchaseStatus = purchase.sellerId ? 'paid' : 'pending';

      const purchaseDataToSave = { ...purchase, items: itemsToSave, status };
      transaction.set(purchaseRef, purchaseDataToSave);

      return generatedId;
    });

    return { id: newPurchaseId, ...purchase };
  } catch (error) {
    console.error("Transaction failed: ", error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
}

// Function to update an existing purchase (e.g., to mark items as returned)
export async function updatePurchase(purchaseId: string, data: Partial<Purchase>): Promise<void> {
    const purchaseRef = doc(db, 'purchases', purchaseId);
    await updateDoc(purchaseRef, data);
}
