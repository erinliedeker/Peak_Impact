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

import { doc, updateDoc } from 'firebase/firestore'; 
// Assuming 'db' is your initialized Firestore instance

import type { UserProfile } from '~~/types/user';

// ------------------------------------------------------------------
// 1. HELPER: Get Collection Reference
// ------------------------------------------------------------------
const getUserCollection = () => collection(getFirestore(), 'users');

// ------------------------------------------------------------------
// 2. MAPPER: Doc -> UserProfile Object
// ------------------------------------------------------------------
const mapDocToUser = (docSnap: QueryDocumentSnapshot<DocumentData>): UserProfile => {
    const data = docSnap.data();
    
    return {
        id: docSnap.id, // In Firestore, the User ID (UID) is typically the document ID
        name: data.name || 'Unknown Volunteer',
        email: data.email || 'N/A',
        organizationId: data.organizationId || null,
        interests: data.interests || [],
        userType: data.userType || 'Resident',
        neighborhoodId: data.neighborhoodId || null,
        impactPoints: data.impactPoints || 0,
        joinedGroups: data.joinedGroups || [],
    } as UserProfile;
};

// ------------------------------------------------------------------
// 3. SERVICE: User Retrieval Operations
// ------------------------------------------------------------------
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

    /**
     *Updates the 'joinedGroups' array on the user's profile document.
     * This is called by the GroupsStore to maintain the user's profile state 
     * in the database.
     * * @param userId The ID of the user whose profile needs updating.
     * @param newJoinedGroups The complete, new array of group IDs the user has joined.
     */
    async updateUserJoinedGroups(userId: string, newJoinedGroups: string[]): Promise<void> {
        const db = getFirestore(); 
        // Get a reference to the specific user's document
        const userRef = doc(db, 'users', userId);
        
        // Use updateDoc to specifically set the new value for the joinedGroups field.
        try {
            await updateDoc(userRef, {
                joinedGroups: newJoinedGroups
            });
            console.log(`[UserService] Successfully updated joinedGroups for user ${userId}.`);
        } catch (error) {
            console.error(`[UserService] Failed to update joinedGroups for user ${userId}:`, error);
            throw new Error("Database update failed.");
        }
    },
};