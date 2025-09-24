
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, doc, setDoc, updateDoc, orderBy, serverTimestamp, getDoc, limit, runTransaction, increment } from "firebase/firestore";
import type { CashboxSession, NewCashboxSession, User } from "@/lib/types";
import { addAuditLog } from "./audit-service";

// Function to get the active (open) session for a specific user
export async function getActiveSessionForUser(userId: string): Promise<CashboxSession | null> {
    const sessionsCol = collection(db, 'cashboxSessions');
    const q = query(sessionsCol, where("userId", "==", userId), where("status", "==", "open"), limit(1));
    const sessionSnapshot = await getDocs(q);

    if (sessionSnapshot.empty) {
        return null;
    }
    
    const sessionDoc = sessionSnapshot.docs[0];
    return { id: sessionDoc.id, ...sessionDoc.data() } as CashboxSession;
}

// Function to get all cashbox sessions, ordered by most recent
export async function getCashboxHistory(): Promise<CashboxSession[]> {
    const sessionsCol = collection(db, 'cashboxSessions');
    const q = query(sessionsCol, orderBy("openedAt", "desc"));
    const sessionSnapshot = await getDocs(q);
    const sessionList = sessionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashboxSession));
    return sessionList;
}

// Function to open a new cashbox session
export async function openCashboxSession(openingBalance: number, user: User): Promise<CashboxSession> {
    const activeSession = await getActiveSessionForUser(user.id);
    if (activeSession) {
        throw new Error("Ya existe una sesión de caja abierta para este usuario.");
    }
    
    const newSession: NewCashboxSession = {
        userId: user.id,
        userName: user.name,
        status: 'open',
        openingBalance,
        openedAt: new Date().toISOString(),
        totalSales: 0,
    };
    
    const sessionsCol = collection(db, 'cashboxSessions');
    const docRef = await addDoc(sessionsCol, newSession);

    await addAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'CASHBOX_OPEN',
        details: `Caja abierta con un saldo inicial de ${openingBalance}.`,
    });

    return { id: docRef.id, ...newSession };
}

// Function to close an existing cashbox session
export async function closeCashboxSession(sessionId: string, closingBalance: number, user: User): Promise<void> {
    const sessionRef = doc(db, 'cashboxSessions', sessionId);

    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists() || sessionDoc.data().status !== 'open') {
        throw new Error("La sesión no existe o ya ha sido cerrada.");
    }
    if (sessionDoc.data().userId !== user.id) {
        throw new Error("No tiene permiso para cerrar esta sesión de caja.");
    }

    await updateDoc(sessionRef, {
        status: 'closed',
        closingBalance: closingBalance,
        closedAt: new Date().toISOString(),
    });

    await addAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'CASHBOX_CLOSE',
        details: `Caja cerrada con un saldo final de ${closingBalance}.`,
    });
}

// Function to add a sale to an active cashbox session within a Firestore transaction
export async function addSaleToCashbox(transaction: any, userId: string, saleAmount: number) {
    // This function must be called from within a runTransaction block.
    // It will read the active session and update the total sales atomically.
    const sessionsCol = collection(db, 'cashboxSessions');
    const q = query(sessionsCol, where("userId", "==", userId), where("status", "==", "open"), limit(1));
    
    // Perform the read inside the transaction
    const sessionSnapshot = await transaction.get(q);

    if (sessionSnapshot.empty) {
        throw new Error("No hay una sesión de caja activa para este vendedor. Por favor, abra la caja primero.");
    }

    const sessionDoc = sessionSnapshot.docs[0];
    const sessionRef = doc(db, 'cashboxSessions', sessionDoc.id);
    
    // Perform the write inside the transaction
    transaction.update(sessionRef, {
        totalSales: increment(saleAmount)
    });
}
