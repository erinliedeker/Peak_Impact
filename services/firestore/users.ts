// services/firestore/users.ts
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs, 
    type DocumentData,
    type QueryDocumentSnapshot,
} from 'firebase/firestore';

// ⭐️ Assuming you have a basic UserProfile type defined somewhere.
// If not, define it like this:
export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    // ... other user-specific fields
}

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
        uid: docSnap.id, // In Firestore, the User ID (UID) is typically the document ID
        name: data.name || 'Unknown Volunteer',
        email: data.email || 'N/A',
        // Add other mapped fields here (e.g., userType: data.userType)
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
        if (uids.length === 0) return [];
        
        // Firestore limits the 'where in' clause to 10 items per query.
        // We will implement a chunking mechanism for safety and scale.
        const CHUNK_SIZE = 10;
        const userProfiles: UserProfile[] = [];

        for (let i = 0; i < uids.length; i += CHUNK_SIZE) {
            const chunk = uids.slice(i, i + CHUNK_SIZE);
            
            // Query where the document ID (which is the UID) is in the current chunk
            const q = query(
                getUserCollection(), 
                where(getFirestore().doc().id, 'in', chunk) // Note: Firestore often uses the special FieldPath.documentId()
                // If you've indexed by a field other than the document ID, use that field here.
            );

            const snapshot = await getDocs(q);
            snapshot.docs.forEach(doc => {
                userProfiles.push(mapDocToUser(doc));
            });
        }
        
        return userProfiles;
    },
};