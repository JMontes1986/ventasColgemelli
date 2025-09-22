
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, setDoc, updateDoc, query, where, limit } from "firebase/firestore";
import type { User, NewUser, ModulePermission } from "@/lib/types";
import { mockUsers } from "@/lib/placeholder-data";
import { addAuditLog } from "./audit-service";
import { getPermissionsForRole } from "@/lib/roles";

// Function to authenticate a user
export async function authenticateUser(username: string, password_provided: string): Promise<User | null> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where("username", "==", username), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log("No user found with username:", username);
        return null; // User not found
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as Omit<User, 'id'>;
    
    // In a real app, you should NEVER store or compare plain text passwords.
    // This should be replaced with a secure hashing and comparison mechanism (e.g., bcrypt).
    if (userData.password === password_provided) {
        return { id: userDoc.id, ...userData };
    }

    console.log("Password mismatch for user:", username);
    return null; // Password incorrect
}


// Function to get all users from Firestore
export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  return userList;
}

// Function to add a new user to Firestore
export async function addUser(user: NewUser): Promise<Omit<User, 'permissions'>> {
  const usersCol = collection(db, 'users');
  const permissions = getPermissionsForRole(user.role);
  
  const docRef = await addDoc(usersCol, {
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      permissions: permissions,
      avatarUrl: user.avatarUrl,
  });
  return { id: docRef.id, ...user };
}

// Function to seed initial users from placeholder data
export async function addSeedUsers(): Promise<void> {
    console.log("Seeding users...");
    const promises = mockUsers.map(user => {
        const permissions = getPermissionsForRole(user.role);
        // Use username as the document ID for predictability
        const userRef = doc(db, 'users', user.username);
        return setDoc(userRef, { ...user, permissions, password: 'password123' });
    });
    await Promise.all(promises);
}

// Function to update a user's permissions in Firestore
export async function updateUserPermissions(userId: string, permissions: ModulePermission[]): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { permissions });
    
    await addAuditLog({
        userId: 'system', // or the ID of the admin making the change
        userName: 'Sistema', // or the name of the admin
        action: 'USER_ROLE_CHANGE', // Re-using this action type
        details: `Permisos del usuario ${userId} actualizados.`,
    });
}
