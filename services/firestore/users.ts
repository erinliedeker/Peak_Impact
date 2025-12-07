// services/firestore/users.ts
import type { UserProfile } from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs, 
    type DocumentData,
    type QueryDocumentSnapshot,
    documentId,
} from 'firebase/firestore';


export const UserService = {

    /**
     * Fetches multiple user profiles by their unique IDs (UIDs).
     * This is required to "hydrate" the attendance records with names/emails.
     * * @param uids An array of volunteer UIDs (strings)
     * @returns A promise resolving to an array of UserProfile objects
     */
    async getUsersByUids(uids: string[]): Promise<UserProfile[]> {
        if (!uids.length) return [];

        const db = getFirestore();
        const usersRef = collection(db, 'users'); // 👈 Correct modular syntax

        // Option A: If you have fewer than 30 volunteers usually
        // We use documentId() to match the Doc ID (which is the UID)
        const q = query(usersRef, where(documentId(), 'in', uids));

        try {
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            } as UserProfile));
        } catch (error) {
            console.error("Error fetching users by UIDs:", error);
            return [];
        }
    }
};