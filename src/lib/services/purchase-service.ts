
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, doc, getDoc } from "firebase/firestore";
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


// Function to add a new purchase to Firestore
export async function addPurchase(purchase: NewPurchase): Promise<Purchase> {
  const purchasesCol = collection(db, 'purchases');
  const docRef = await addDoc(purchasesCol, purchase);
  return { id: docRef.id, ...purchase };
}
