// --- Shared Data Types ---

/**
 * Defines the status of a specific volunteer for a specific event.
 */
export interface VolunteerAttendance {
    volunteerId: number;
    volunteerName: string; // Used for letter generation
    signedUp: boolean;
    checkInTime: string | null; // ISO format datetime
    checkOutTime: string | null; // ISO format datetime
    hoursVerified: boolean; // For the service hour verification letter
    verificationLetterSent: boolean;
}

/**
 * Update the ConnectEvent interface to include the attendance array.
 */
export interface ConnectEvent {
    id: string;
    title: string;
    description: string;
    organizationId: string | number;
    organizationName: string;
    
    // We update location to allow a simple string for Mobilize events, 
    // or keep your existing GeoLocation object for Firestore events.
    location: GeoLocation | string; 
    
    date: string;
    start: string | null;
    end: string | null
    
    // You might want to allow 'string' here if Mobilize categories 
    // don't match your hardcoded union types exactly.
    category: 'PublicSafety' | 'Environment' | 'Youth' | 'Arts' | 'Social' | string;
    
    volunteersNeeded: number;
    volunteersSignedUp: number;
    isMicroProject: boolean;
    suppliesNeeded: string[];
    attendees: VolunteerAttendance[]; 
    createdAt: string;

    // --- NEW OPTIONAL FIELDS FOR MOBILIZE ---
    
    // Marks the event as external so the UI knows to show a "Visit Site" button
    isExternal?: boolean;

    // The direct link to the Mobilize event page
    externalUrl?: string;

    // Mobilize often provides a featured image, which looks great in the UI
    imageUrl?: string;
}
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