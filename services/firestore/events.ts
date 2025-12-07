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
    Timestamp 
} from 'firebase/firestore';
import type { ConnectEvent, GeoLocation, VolunteerAttendance } from '~~/types/event';

// ------------------------------------------------------------------
// 1. HELPER: Get Collection Reference
// ------------------------------------------------------------------
const getEventCollection = () => collection(getFirestore(), 'events');

// ------------------------------------------------------------------
// 2. MAPPER: Doc -> Event Object
// ------------------------------------------------------------------
const mapDocToEvent = (docSnap: QueryDocumentSnapshot<DocumentData>): ConnectEvent => {
    const data = docSnap.data();
    // console.log(data) // debug if needed

    // Helper: Safe Timestamp -> ISO String conversion
    const toIsoString = (val: any): string | null => {
        if (!val) return null;
        if (typeof val.toDate === 'function') {
            return val.toDate().toISOString();
        }
        return typeof val === 'string' ? val : null;
    };
    
    // Helper: Safe Location mapping
    // We strictly map Firestore locations to the GeoLocation object structure
    // effectively ignoring the "string" type option used for Mobilize.
    const mapLocation: GeoLocation = data.location && typeof data.location.lat === 'number'
        ? { lat: data.location.lat, lng: data.location.lng }
        : { lat: 0, lng: 0}; 

    // Helper: Safe Attendee mapping
    const mapAttendee = (att: any): VolunteerAttendance => ({
        volunteerId: att.volunteerId || 0,
        // Optional chaining handles missing fields gracefully
        checkInTime: toIsoString(att.checkInTime) || null,
        checkOutTime: toIsoString(att.checkOutTime) || null,
        hoursVerified: !!att.hoursVerified,
        verificationLetterSent: !!att.verificationLetterSent,
        volunteerName: '',
        signedUp: false
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

        // --- NEW FIELDS HANDLED SAFELY ---
        // If these don't exist in Firestore, they default to false/undefined
        // preventing the "External" UI from triggering accidentally.
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
            // Ensure external flags are false for internal creations unless specified
            isExternal: false, 
        };

        const docRef = await addDoc(getEventCollection(), payload);
        return docRef.id;
    },

    /**
     * Update an existing event in Firestore
     */
    async update(id: string | number, eventData: Partial<ConnectEvent>): Promise<void> {
        const db = getFirestore();
        const eventRef = doc(db, 'events', String(id));
        
        const { id: _, ...updatePayload } = eventData;

        await updateDoc(eventRef, updatePayload);
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
    async updateAttendees(eventId: string, attendees: VolunteerAttendance[]): Promise<void> {
        const db = getFirestore();
        const eventRef = doc(db, 'events', eventId);

        await updateDoc(eventRef, {
            attendees: attendees
        });
    },
};