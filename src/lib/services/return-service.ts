
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy, getDoc, doc } from "firebase/firestore";
import type { Return, NewReturn, User } from "@/lib/types";
import { increaseProductStock } from "./product-service";

// Function to get all returns from Firestore, ordered by most recent
export async function getReturns(): Promise<Return[]> {
  const returnsCol = collection(db, 'returns');
  const q = query(returnsCol, orderBy("returnedAt", "desc"));
  const returnSnapshot = await getDocs(q);
  const returnList = returnSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Return));
  return returnList;
}

// Function to add a new return record and update stock
export async function addReturnAndUpdateStock(returnRecord: NewReturn): Promise<Return> {
  // 1. Increase the stock of the product
  // For returns, we don't pass the user, so it won't be audited as a manual restock
  await increaseProductStock(returnRecord.productId, returnRecord.quantity);

  // 2. Log the return action in the 'returns' collection
  const returnsCol = collection(db, 'returns');
  const docRef = await addDoc(returnsCol, returnRecord);
  
  return { id: docRef.id, ...returnRecord };
}

    