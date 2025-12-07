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
// This mirrors the pattern in your working OrgService. 
// It ensures getFirestore() is called at the correct time.
const getEventCollection = () => collection(getFirestore(), 'events');

// ------------------------------------------------------------------
// 2. MAPPER: Doc -> Event Object
// ------------------------------------------------------------------
const mapDocToEvent = (docSnap: QueryDocumentSnapshot<DocumentData>): ConnectEvent => {
    const data = docSnap.data();
    console.log(data)

    // Helper: Safe Timestamp -> ISO String conversion
    const toIsoString = (val: any): string | null => {
        if (!val) return null;
        // Check if it's a Firestore Timestamp (has toDate method)
        if (typeof val.toDate === 'function') {
            return val.toDate().toISOString();
        }
        return typeof val === 'string' ? val : null;
    };
    
    // Helper: Safe Location mapping
    const mapLocation: GeoLocation = data.location && typeof data.location.lat === 'number'
        ? { lat: data.location.lat, lng: data.location.lng }
        : { lat: 0, lng: 0 }; 

    // Helper: Safe Attendee mapping
    const mapAttendee = (att: any): VolunteerAttendance => ({
        volunteerId: att.volunteerId || 0,
        volunteerName: att.volunteerName || 'Unknown',
        signedUp: !!att.signedUp, 
        hoursVerified: !!att.hoursVerified,
        verificationLetterSent: !!att.verificationLetterSent,
        checkInTime: toIsoString(att.checkInTime),
        checkOutTime: toIsoString(att.checkOutTime),
    });

    return {
        id: docSnap.id, 
        title: data.title || 'Untitled Event',
        description: data.description || '',
        organizationId: String(data.organizationId) || '', // Force string to match ID types
        organizationName: data.organizationName || 'Unknown Organization',
        
        location: mapLocation, 
        
        date: data.date || '',
        time: data.time || '',
        
        // Cast is needed for strict union type in your interface
        category: (data.category as ConnectEvent['category']) || 'Social', 
        
        volunteersNeeded: data.volunteersNeeded || 0,
        volunteersSignedUp: data.volunteersSignedUp || 0,
        isMicroProject: !!data.isMicroProject,
        suppliesNeeded: data.suppliesNeeded || [],
        
        attendees: (data.attendees || []).map(mapAttendee), 
        
        createdAt: toIsoString(data.createdAt) || new Date().toISOString(),
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
        };

        // Uses the helper function (fixes "fetch undefined")
        const docRef = await addDoc(getEventCollection(), payload);
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

    /**
     * Fetch ALL events
     */
    async getAll(): Promise<ConnectEvent[]> {
        // Uses the helper function (fixes "fetch undefined")
        const snapshot = await getDocs(getEventCollection());
        
        return snapshot.docs.map(mapDocToEvent);
    },

    /**
     * Fetch events created by a specific organization ID.
     */
    async getByOrganizationId(orgId: string | number): Promise<ConnectEvent[]> {
        const eventsCollection = getEventCollection();
        
        // Query events where the 'organizationId' matches
        const q = query(eventsCollection, where("organizationId", "==", String(orgId)));
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDocToEvent);
    },
    async updateAttendees(eventId: string, attendees: VolunteerAttendance[]): Promise<void> {
        const db = getFirestore();
        const eventRef = doc(db, 'events', eventId);

        // We update JUST the attendees array field
        await updateDoc(eventRef, {
            attendees: attendees
        });
    },
};