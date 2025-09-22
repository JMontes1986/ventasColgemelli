
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, doc, getDoc, runTransaction, setDoc, DocumentReference, updateDoc, orderBy, limit, increment } from "firebase/firestore";
import type { Purchase, NewPurchase, Product, PurchaseStatus, CartItem, User } from "@/lib/types";
import { addAuditLog } from "./audit-service";
import { useMockAuth } from "@/hooks/use-mock-auth";

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
  // Remove orderBy from the query to avoid needing a composite index
  const q = query(purchasesCol, where("cedula", "==", cedula));
  const purchaseSnapshot = await getDocs(q);
  const purchaseList = purchaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
  
  // Sort the results in application code instead of in the query
  return purchaseList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Function to get all purchases for a given celular from Firestore
export async function getPurchasesByCelular(celular: string): Promise<Purchase[]> {
  const purchasesCol = collection(db, 'purchases');
   // Remove orderBy from the query to avoid needing a composite index
  const q = query(purchasesCol, where("celular", "==", celular));
  const purchaseSnapshot = await getDocs(q);
  const purchaseList = purchaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));

  // Sort the results in application code instead of in the query
  return purchaseList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
          .map(item => transaction.get(doc(db, 'products', item.id)))
      );
      
      const counterDoc = await transaction.get(counterRef);

      // --- VALIDATION AND PREPARATION phase ---

      // Validate products and prepare stock updates
      const stockUpdates: { ref: DocumentReference, newStock: number }[] = [];
      for (let i = 0; i < productDocs.length; i++) {
        const productDoc = productDocs[i];
        const item = purchase.items[i];
        
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
      const itemsToSave = purchase.items.map(({...item}) => ({...item, returned: false }));
      
      const purchaseDataToSave = { ...purchase, items: itemsToSave };
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


// Function to add a new pre-sale purchase to Firestore (no stock check)
export async function addPreSalePurchase(purchase: NewPurchase): Promise<Purchase> {
  const counterRef = doc(db, "counters", "preSaleCounter");

  const firstItemInitial = purchase.items.length > 0 
    ? purchase.items[0].name.charAt(0).toUpperCase().replace(/[^A-Z]/g, 'X')
    : 'X';
  
  try {
    const newPurchaseId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let newCount = 1;
      if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
      }
      
      const formattedCount = String(newCount).padStart(4, '0');
      const generatedId = `PV${firstItemInitial}${formattedCount}`;

      // Update product preSaleSold counts
      for (const item of purchase.items) {
          const productRef = doc(db, 'products', item.id);
          transaction.update(productRef, { preSaleSold: increment(item.quantity) });
      }

      transaction.set(counterRef, { count: newCount }, { merge: true });

      const purchaseRef = doc(db, 'purchases', generatedId);
      const itemsToSave = purchase.items.map(item => ({...item, returned: false}));
      
      const purchaseDataToSave = { ...purchase, items: itemsToSave, status: 'pre-sale' };
      transaction.set(purchaseRef, purchaseDataToSave);

      return generatedId;
    });
    
    return { id: newPurchaseId, ...purchase };
  } catch (error) {
    console.error("Pre-sale transaction failed: ", error);
    throw error;
  }
}


// Function to update an existing purchase (e.g., to mark items as returned)
export async function updatePurchase(purchaseId: string, data: Partial<Purchase>): Promise<void> {
    const purchaseRef = doc(db, 'purchases', purchaseId);
    await updateDoc(purchaseRef, data);
}

// Function to cancel a purchase and return items to stock
export async function cancelPurchaseAndUpdateStock(purchaseId: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const purchaseRef = doc(db, "purchases", purchaseId);
    const purchaseDoc = await transaction.get(purchaseRef);

    if (!purchaseDoc.exists()) {
      throw new Error("Purchase not found");
    }

    const purchaseData = purchaseDoc.data() as Purchase;

    // Return items to stock
    for (const item of purchaseData.items) {
      const productRef = doc(db, "products", item.id);
      transaction.update(productRef, { stock: increment(item.quantity) });
    }

    // Update purchase status to cancelled
    transaction.update(purchaseRef, { status: "cancelled" });
  });
}


export async function updatePendingPurchase(purchaseId: string, newCart: Omit<CartItem, 'type' | 'stock'>[]): Promise<void> {
  await runTransaction(db, async (transaction) => {
    // --- 1. READ PHASE ---
    const purchaseRef = doc(db, "purchases", purchaseId);
    const purchaseDoc = await transaction.get(purchaseRef);

    if (!purchaseDoc.exists() || purchaseDoc.data().status !== 'pending') {
      throw new Error("Compra no encontrada o ya ha sido procesada.");
    }

    const originalPurchase = purchaseDoc.data() as Purchase;
    const originalItems = originalPurchase.items;

    // --- 2. CALCULATION & VALIDATION PHASE ---
    
    // Create maps for easy lookup
    const originalItemMap = new Map(originalItems.map(item => [item.id, item.quantity]));
    const newItemMap = new Map(newCart.map(item => [item.id, item.quantity]));
    
    // Calculate stock changes
    const stockChanges = new Map<string, number>();

    // Items removed or quantity decreased
    originalItemMap.forEach((origQty, id) => {
        const newQty = newItemMap.get(id) || 0;
        const diff = origQty - newQty;
        if (diff > 0) {
            stockChanges.set(id, (stockChanges.get(id) || 0) + diff); // Return stock
        }
    });

    // Items added or quantity increased
    newItemMap.forEach((newQty, id) => {
        const origQty = originalItemMap.get(id) || 0;
        const diff = newQty - origQty;
        if (diff > 0) {
            stockChanges.set(id, (stockChanges.get(id) || 0) - diff); // Reserve stock
        }
    });

    // Validate new stock levels
    for (const [productId, change] of stockChanges.entries()) {
      if (change < 0) { // Only need to check for stock reservation
        const productRef = doc(db, "products", productId);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) throw new Error(`Producto ${productId} no encontrado.`);
        
        const currentStock = productDoc.data().stock;
        if (currentStock + change < 0) {
          throw new Error(`Stock insuficiente para ${productDoc.data().name}.`);
        }
      }
    }

    // --- 3. WRITE PHASE ---

    // Apply stock changes
    for (const [productId, change] of stockChanges.entries()) {
      const productRef = doc(db, "products", productId);
      transaction.update(productRef, { stock: increment(change) });
    }

    // Update the purchase document
    const newTotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemsToSave = newCart.map(({...item}) => ({...item, returned: false }));
    
    transaction.update(purchaseRef, {
      items: itemsToSave,
      total: newTotal,
      date: new Date().toLocaleString('es-CO'), // Update date to reflect modification time
    });
  });
}

export async function confirmPreSaleAndUpdateStock(purchaseId: string, currentUser: User): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const purchaseRef = doc(db, "purchases", purchaseId);
        const purchaseDoc = await transaction.get(purchaseRef);

        if (!purchaseDoc.exists() || purchaseDoc.data().status !== 'pre-sale') {
            throw new Error("Preventa no encontrada o ya ha sido confirmada.");
        }

        const purchaseData = purchaseDoc.data() as Purchase;

        // Increase stock for each item in the pre-sale
        for (const item of purchaseData.items) {
            const productRef = doc(db, "products", item.id);
            transaction.update(productRef, { stock: increment(item.quantity) });
        }

        // Update purchase status
        transaction.update(purchaseRef, { status: "pre-sale-confirmed" });
        
        // Log the confirmation in audit
        await addAuditLog({
            userId: currentUser.id,
            userName: currentUser.name,
            action: 'STOCK_RESTOCK', // Reusing this action
            details: `Preventa ${purchaseId} confirmada. Stock actualizado.`,
        });
    });
}
