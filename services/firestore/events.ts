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
    getDoc, // ⭐️ NEW: Required for getById
    type DocumentData,
    type QueryDocumentSnapshot,
    Timestamp 
} from 'firebase/firestore';
// ⭐️ IMPORT Attendee as well, although not directly used here, it's good practice
import type { ConnectEvent, GeoLocation, VolunteerAttendance, Attendee } from '~~/types/event';

// ------------------------------------------------------------------
// 1. HELPER: Get Collection Reference
// ------------------------------------------------------------------
const getEventCollection = () => collection(getFirestore(), 'events');

// ------------------------------------------------------------------
// 2. MAPPER: Doc -> Event Object
// ------------------------------------------------------------------
const mapDocToEvent = (docSnap: QueryDocumentSnapshot<DocumentData>): ConnectEvent => {
    const data = docSnap.data();

    // Helper: Safe Timestamp -> ISO String conversion
    const toIsoString = (val: any): string | null => {
        if (!val) return null;
        if (typeof val.toDate === 'function') {
            return val.toDate().toISOString();
        }
        return typeof val === 'string' ? val : null;
    };
    
    // Helper: Safe Location mapping (Unchanged)
    const mapLocation: GeoLocation = data.location && typeof data.location.lat === 'number'
        ? { lat: data.location.lat, lng: data.location.lng }
        : { lat: 0, lng: 0}; 

    // Helper: Safe Attendee mapping
    const mapAttendee = (att: any): VolunteerAttendance => ({
        volunteerId: String(att.volunteerId || ''), 
        
        status: (att.status as VolunteerAttendance['status']) || 'registered', 
        
        checkInTime: toIsoString(att.checkInTime) || null,
        checkOutTime: toIsoString(att.checkOutTime) || null,
        hoursVerified: !!att.hoursVerified,
        verificationLetterSent: !!att.verificationLetterSent,
    });

    return {
        id: docSnap.id, 
        title: data.title || 'Untitled Event',
        description: data.description || '',
        
        organizationId: String(data.organizationId) || '',
        organizationName: data.organizationName || 'Unknown Organization',
        
        location: mapLocation, 
        
        date: data.date || '',
        time: data.time || '',
        
        category: (data.category as ConnectEvent['category']) || 'Social', 
        
        volunteersNeeded: data.volunteersNeeded || 0,
        volunteersSignedUp: data.volunteersSignedUp || 0, 
        
        isMicroProject: !!data.isMicroProject,
        suppliesNeeded: data.suppliesNeeded || [],
        
        attendees: (data.attendees || []).map(mapAttendee), 
        
        createdAt: toIsoString(data.createdAt) || new Date().toISOString(),

        isExternal: !!data.isExternal, 
        externalUrl: data.externalUrl || undefined,
        imageUrl: data.imageUrl || undefined
    };
};

// ------------------------------------------------------------------
// 3. SERVICE: CRUD Operations
// ------------------------------------------------------------------
export const EventService = {
    /**
     * Create a new event in Firestore
     */
    async create(eventData: Omit<ConnectEvent, 'id'>): Promise<string> {
        const payload = {
            ...eventData,
            createdAt: Timestamp.now(),
            isExternal: false, 
        };

        const docRef = await addDoc(getEventCollection(), payload);
        return docRef.id;
    },

    /**
     * Update an existing event in Firestore
     */
    async update(id: string, eventData: Partial<ConnectEvent>): Promise<void> {
        const db = getFirestore();
        // Ensure ID is a string for the doc path
        const eventRef = doc(db, 'events', id); 
        
        // Destructure to remove 'id' if it accidentally came with eventData
        const { id: _, ...updatePayload } = eventData;

        await updateDoc(eventRef, updatePayload);
    },

    /**
     * ⭐️ NEW METHOD: Fetch a single event by ID (Required by fetchEventAttendees)
     */
    async getById(id: string): Promise<ConnectEvent | null> {
        const db = getFirestore();
        const eventRef = doc(db, 'events', id);
        const docSnap = await getDoc(eventRef);

        if (docSnap.exists()) {
            // Note: Since mapDocToEvent expects QueryDocumentSnapshot, we need a slight adjustment
            // or a dedicated mapper for docSnap.get().
            // For simplicity, we create a temporary QDS-like object:
            const tempSnap = {
                id: docSnap.id,
                data: () => docSnap.data(),
                // Add any other properties mapDocToEvent might use (like exists, etc.)
            } as QueryDocumentSnapshot<DocumentData>;
            
            return mapDocToEvent(tempSnap);
        }
        return null;
    },

    /**
     * Fetch ALL events
     */
    async getAll(): Promise<ConnectEvent[]> {
        const snapshot = await getDocs(getEventCollection());
        return snapshot.docs.map(mapDocToEvent);
    },

    /**
     * Fetch events created by a specific organization ID.
     */
    async getByOrganizationId(orgId: string | number): Promise<ConnectEvent[]> {
        const eventsCollection = getEventCollection();
        const q = query(eventsCollection, where("organizationId", "==", String(orgId)));
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDocToEvent);
    },

    /**
     * Updates ONLY the attendees array on the event document.
     */
    async updateAttendees(eventId: string, attendees: VolunteerAttendance[]): Promise<void> {
        const db = getFirestore();
        const eventRef = doc(db, 'events', eventId);

        await updateDoc(eventRef, {
            attendees: attendees
        });
    },
};