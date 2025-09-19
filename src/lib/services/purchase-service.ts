
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import type { Purchase, NewPurchase } from "@/lib/types";

// Function to get all purchases for a given cedula from Firestore
export async function getPurchasesByCedula(cedula: string): Promise<Purchase[]> {
  const purchasesCol = collection(db, 'purchases');
  const q = query(purchasesCol, where("cedula", "==", cedula));
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
