
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import type { Return, NewReturn } from "@/lib/types";

// Function to get all returns from Firestore, ordered by most recent
export async function getReturns(): Promise<Return[]> {
  const returnsCol = collection(db, 'returns');
  const q = query(returnsCol, orderBy("returnedAt", "desc"));
  const returnSnapshot = await getDocs(q);
  const returnList = returnSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Return));
  return returnList;
}

// Function to add a new return record to Firestore
export async function addReturn(returnRecord: NewReturn): Promise<Return> {
  const returnsCol = collection(db, 'returns');
  const docRef = await addDoc(returnsCol, returnRecord);
  return { id: docRef.id, ...returnRecord };
}
