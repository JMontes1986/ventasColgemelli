
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, doc, getDoc, runTransaction, setDoc } from "firebase/firestore";
import type { Purchase, NewPurchase } from "@/lib/types";

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

// Function to add a new purchase to Firestore with a custom ID
export async function addPurchase(purchase: NewPurchase): Promise<Purchase> {
  const counterRef = doc(db, "counters", "purchaseCounter");

  // Get the first letter of the first item, or 'X' if cart is empty.
  const firstItemInitial = purchase.items.length > 0 
    ? purchase.items[0].name.charAt(0).toUpperCase()
    : 'X';

  // Increment the counter and create the new purchase in a transaction
  const newPurchaseId = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    
    let newCount = 1;
    if (counterDoc.exists()) {
      newCount = counterDoc.data().count + 1;
    }
    
    transaction.set(counterRef, { count: newCount }, { merge: true });
    
    const formattedCount = String(newCount).padStart(4, '0');
    return `CG${firstItemInitial}${formattedCount}`;
  });

  const purchaseRef = doc(db, 'purchases', newPurchaseId);
  await setDoc(purchaseRef, purchase);

  return { id: newPurchaseId, ...purchase };
}
