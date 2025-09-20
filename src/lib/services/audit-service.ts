
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import type { AuditLog, NewAuditLog } from "@/lib/types";

// Function to get all audit logs from Firestore, ordered by most recent
export async function getAuditLogs(): Promise<AuditLog[]> {
  const logsCol = collection(db, 'auditLogs');
  const q = query(logsCol, orderBy("timestamp", "desc"));
  const logSnapshot = await getDocs(q);
  const logList = logSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
  return logList;
}

// Function to add a new audit log record to Firestore
export async function addAuditLog(logRecord: NewAuditLog): Promise<AuditLog> {
  const logsCol = collection(db, 'auditLogs');
  const docRef = await addDoc(logsCol, {
      ...logRecord,
      timestamp: new Date().toISOString(), // Ensure server-generated timestamp
  });
  return { id: docRef.id, ...logRecord, timestamp: new Date().toISOString() };
}
