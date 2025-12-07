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
    id: number;
    title: string;
    description: string;
    organizationId: number;
    organizationName: string;
    location: GeoLocation;
    date: string;
    time: string;
    category: 'PublicSafety' | 'Environment' | 'Youth' | 'Arts' | 'Social';
    volunteersNeeded: number;
    volunteersSignedUp: number;
    isMicroProject: boolean;
    suppliesNeeded: string[];
    // NEW: Array to track all volunteers for the event
    attendees: VolunteerAttendance[]; 
}

/**
 * Defines the geographic coordinates for an event or micro-project.
 */
export interface GeoLocation {
    lat: number;
    lng: number;
}

/**
 * Defines the core structure for a volunteer opportunity (Event, Cleanup, Gathering).
 */
export interface ConnectEvent {
    id: number;
    title: string;
    description: string;
    organizationId: number;
    organizationName: string;
    location: GeoLocation;
    date: string; // ISO format
    time: string;
    category: 'PublicSafety' | 'Environment' | 'Youth' | 'Arts' | 'Social';
    volunteersNeeded: number;
    volunteersSignedUp: number;
    isMicroProject: boolean; // Differentiates from large events
    suppliesNeeded: string[];
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
}

// --- Store State Types ---

// 1. Events Store State
export interface EventsState {
    allEvents: ConnectEvent[];
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