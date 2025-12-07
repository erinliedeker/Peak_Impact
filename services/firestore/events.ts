// services/firestore/events.ts
import { 
    getFirestore, 
    collection, 
    addDoc,
    doc,        
    updateDoc,   
    query, 
    where, 
    getDocs, 
    type DocumentData,
    type QueryDocumentSnapshot,
    Timestamp // <-- Ensure Timestamp is imported
} from 'firebase/firestore';
import type { ConnectEvent, GeoLocation } from '~~/types/event'; // <-- GeoLocation must be defined

const mapDocToEvent = (docSnap: QueryDocumentSnapshot<DocumentData>): ConnectEvent => {
    const data = docSnap.data();

    console.log(data)

    // 1. Convert the non-serializable Firestore Timestamp to a standardized string
    const createdAtString = (data.createdAt instanceof Timestamp)
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString();
        
    // 2. Safely map the location object
    const eventLocation: GeoLocation = data.location && typeof data.location.lat === 'number'
        ? { lat: data.location.lat, lng: data.location.lng }
        : { lat: 0, lng: 0 }; // Fallback for location

    // 3. Ensure all required fields (including createdAt and attendees) are mapped
    return {
        id: docSnap.id, 
        title: data.title || 'Untitled Event',
        description: data.description || '',
        organizationId: data.organizationId || null,
        organizationName: data.organizationName || 'Unknown Organization',
        
        // 🚨 FIX: Map the data, do not set to null
        // location: eventLocation, 
        
        date: data.date || '',
        time: data.time || '',
        category: data.category || 'Social',
        volunteersNeeded: data.volunteersNeeded || 0,
        volunteersSignedUp: data.volunteersSignedUp || 0,
        isMicroProject: data.isMicroProject || false,
        suppliesNeeded: data.suppliesNeeded || [],
        
        // 🚨 FIX: Map attendees (assuming attendees is an array of VolunteerAttendance or any[])
        // attendees: data.attendees || [], 
        
        // 🚨 FIX: Map the converted createdAt field
        createdAt: createdAtString,
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
     * Update an existing event in Firestore
     */
    async update(id: string | number, eventData: Partial<ConnectEvent>): Promise<void> {
        const db = getFirestore();
        // Create a reference to the specific document
        const eventRef = doc(db, 'events', String(id));
        
        // Remove the 'id' from the payload to prevent writing it as a field inside the document
        const { id: _, ...updatePayload } = eventData;

        // Perform the update
        await updateDoc(eventRef, updatePayload);
    },

    async getAll(): Promise<ConnectEvent[]> {
        const db = getFirestore();
        const eventsCollection = collection(db, 'events');
        
        // No query filtering needed, just get all documents in the collection
        const snapshot = await getDocs(eventsCollection);
        
        return snapshot.docs.map(mapDocToEvent);
    },

    /**
     * Fetch events created by a specific organization ID.
     */
    async getByOrganizationId(orgId: string | number): Promise<ConnectEvent[]> {
        const db = getFirestore();
        const eventsCollection = collection(db, 'events');
        
        // Query events where the 'organizationId' matches
        const q = query(eventsCollection, where("organizationId", "==", orgId));
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDocToEvent);
    },
};