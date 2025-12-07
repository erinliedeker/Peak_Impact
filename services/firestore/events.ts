// services/firestore/events.ts
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    Timestamp,
    type DocumentData 
} from 'firebase/firestore';
import type { ConnectEvent } from '~~/types/event';

// Helper to map Firestore Document to ConnectEvent
const mapDocToEvent = (doc: DocumentData): ConnectEvent => {
    const data = doc.data();
    // Ensure all fields are safely mapped with defaults
    return {
        id: doc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        organizationId: data.organizationId || null,
        organizationName: data.organizationName || 'Unknown Organization',
        location: data.location || { lat: 0, lng: 0 },
        date: data.date || '',
        time: data.time || '',
        category: data.category || 'Social',
        volunteersNeeded: data.volunteersNeeded || 0,
        volunteersSignedUp: data.volunteersSignedUp || 0,
        isMicroProject: data.isMicroProject || false,
        suppliesNeeded: data.suppliesNeeded || [],
        attendees: data.attendees || [],
    };
};

export const EventService = {
    /**
     * Create a new event in Firestore
     */
    async create(eventData: Omit<ConnectEvent, 'id'>): Promise<string> {
        const db = getFirestore();
        const payload = {
            ...eventData,
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'events'), payload);
        return docRef.id;
    },

    /**
     * Fetch events created by a specific organization ID.
     */
    async getByOrganizationId(orgId: string | number): Promise<ConnectEvent[]> {
        const db = getFirestore();
        const eventsCollection = collection(db, 'events');
        
        // Query events where the 'organizationId' field matches the admin's owned organization ID
        const q = query(eventsCollection, where("organizationId", "==", orgId));
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDocToEvent);
    }
};