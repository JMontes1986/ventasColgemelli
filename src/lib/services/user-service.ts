
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import type { User, NewUser, UpdatableUser } from "@/lib/types";
import { mockUsers } from "@/lib/placeholder-data";

// Function to get all users from Firestore
export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  return userList;
}

// Function to add a new user to Firestore
export async function addUser(user: NewUser): Promise<User> {
  const usersCol = collection(db, 'users');
  const docRef = await addDoc(usersCol, user);
  return { id: docRef.id, ...user };
}

// Function to seed initial users from placeholder data
export async function addSeedUsers(): Promise<void> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    
    // Only seed if the collection is empty
    if (userSnapshot.empty) {
        console.log("Seeding users...");
        for (const user of mockUsers) {
            const userRef = doc(db, 'users', user.id);
            // Don't set the ID field inside the document
            const { id, ...userData } = user;
            await setDoc(userRef, userData);
        }
    } else {
        console.log("Users collection is not empty. Skipping seed.");
    }
}

// Function to update a user's role in Firestore
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
}
