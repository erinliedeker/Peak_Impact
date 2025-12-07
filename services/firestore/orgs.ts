// services/firestore/orgs.ts
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    where,
    type DocumentData 
} from 'firebase/firestore';
import type { Organization } from '~~/types/event';

// Helper to get the collection reference
const getOrgCollection = () => collection(getFirestore(), 'organizations');

// Converter: Maps Firestore data to your Organization interface
// This ensures your app never crashes due to missing fields in the DB
const mapDocToOrg = (doc: DocumentData): Organization => {
    const data = doc.data();
    return {
        id: doc.id, // Firestore ID is a string
        ein: data.ein || null,
        admins: data.admins || [],
        name: data.name || 'Unknown Org',
        type: data.type || 'NonProfit',
        propublica: false,
        description: data.description || '',
        contactEmail: data.contactEmail || '',
        socialLinks: {
            instagram: data.socialLinks?.instagram || null,
            facebook: data.socialLinks?.facebook || null,
        }
    };
};

export const OrgService = {
    /**
     * Fetch all local organizations from Firestore
     */
    async getAll(): Promise<Organization[]> {
        const db = getFirestore();
        const snapshot = await getDocs(getOrgCollection());
        return snapshot.docs.map(mapDocToOrg);
    },

    /**
     * Create a new organization in Firestore
     * @param orgData - The data to save (excluding ID, which is auto-generated)
     */
    async create(orgData: Omit<Organization, 'id'>): Promise<string> {
        // 1. Add the document
        const docRef = await addDoc(getOrgCollection(), orgData);
        return docRef.id; // Return the new ID
    },

    /**
     * Example: Fetch orgs created by a specific user (admin)
     */
    async getByAdmin(userId: string): Promise<Organization[]> {
        const q = query(getOrgCollection(), where("admins", "array-contains", userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDocToOrg);
    }
};