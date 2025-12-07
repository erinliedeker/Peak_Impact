// --- Shared Data Types ---

/**
 * VolunteerAttendance (Database Record)
 * Defines the administrative status of a specific volunteer for a specific event.
 * This is the structure saved inside the ConnectEvent's 'attendees' array.
 */
export interface VolunteerAttendance {
    volunteerId: string; //same as userId string
    status: 'registered' | 'checked-in' | 'completed' | 'cancelled'; 
    
    // Time/Verification Data
    checkInTime: string | null; // ISO format datetime
    checkOutTime: string | null; // ISO format datetime
    hoursVerified: boolean;
    verificationLetterSent: boolean;
}

/**
 * Attendee (UI Object/Merged View)
 * This is the combined view (VolunteerAttendance + User Profile) used by the dashboard modal.
 */
export interface Attendee {
    /** The unique identifier (UID) of the volunteer. */
    uid: string;
    name: string; 
    email: string; 
    
    /** The attendance status for THIS event (mirrored from VolunteerAttendance). */
    status: 'registered' | 'checked-in' | 'completed' | 'cancelled';
    
    // Include other necessary fields from VolunteerAttendance for display/actions
    checkInTime: string | null;
    checkOutTime: string | null;
}


/**
 * Update the ConnectEvent interface to use the correct VolunteerAttendance type.
 */
export interface ConnectEvent {
    id: string;
    title: string;
    description: string;
    organizationId: string; 
    organizationName: string;
    
    location: GeoLocation | string; 
    
    date: string;
    time: string;
    
    category: 'PublicSafety' | 'Environment' | 'Youth' | 'Arts' | 'Social' | string;
    
    volunteersNeeded: number;
    volunteersSignedUp: number;
    isMicroProject: boolean;
    suppliesNeeded: string[];
    
    attendees: VolunteerAttendance[]; 
    
    createdAt: string;

    // --- NEW OPTIONAL FIELDS FOR MOBILIZE ---
    isExternal?: boolean;
    externalUrl?: string;
    imageUrl?: string;
}

// ... (GeoLocation, Organization, and Store State Types remain the same)
/**
 * Defines the geographic coordinates for an event or micro-project.
 */
export interface GeoLocation {
    lat: number;
    lng: number;
}
/**
 * Defines the structure of an Organization or Group profile.
 */
export interface Organization {
    id: string | number; 
    ein: string | null;
    admins: string[];
    name: string;
    propublica: boolean;
    type: 'NonProfit' | 'School' | 'NeighborhoodGroup' | 'CityDept';
    description: string;
    contactEmail: string;
    socialLinks: {
        instagram: string | null;
        facebook: string | null;
    };
    interests: string[];
}

// --- Store State Types ---

// 1. Events Store State
export interface EventsState {
    allEvents: ConnectEvent[];
    organizationEvents: ConnectEvent[],
    isLoading: boolean;
    activeFilters: {
        category: string | null;
        timeCommitment: string | null;
        neighborhoodId: number | null;
    };
    error: string | null;
}

// 2. Impact Store State
export interface ImpactState {
    totalHours: number;
    streakDays: number;
    impactPoints: number;
    earnedBadges: string[]; // e.g., ['Trail Blazer', 'Safety Champion']
    collaboratorList: { name: string, eventsCount: number }[];
    neighborhoodRank: number;
}

// 3. Organization Store State
export interface OrgState {
    allOrganizations: Organization[];
    followedOrganizations: string[]; // Array of organization IDs
    neighborhoodGroups: Organization[];
    ownedOrganization: Organization | null;
    isLoading: boolean;
    error: string | null;
}