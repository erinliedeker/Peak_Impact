// Define the type for the small, linked members displayed in the facepile
export interface GroupMember {
    id: string;
    name: string;
    avatarUrl: string;
}

// Define the structure for the small event cards displayed in the events section
export interface GroupUpcomingEvent {
    id: string;
    title: string;
    date: string; // ISO 8601 string, e.g., '2023-11-15'
    location: string;
    goingCount: number;
}

// Define the structure for posts in the activity feed
export interface GroupActivityPost {
    id: string;
    authorName: string;
    authorAvatar: string;
    timeAgo: string; // e.g., '2h ago'
    content: string;
    image?: string; // Optional image URL
    likes: number;
}

// types/group.ts (or wherever GroupBasecampData lives)

// 1. Import the base administrative type that defines: 
//    id, ein, admins, name, propublica, type, description, contactEmail, socialLinks, interests
// NOTE: Adjust the path below if './event' is not correct.
import type { Organization } from './event'; 

// Define the fields specific to the UI/Detail page
export interface GroupDetailFields {
    location: string;
    bannerUrl: string;
    themeColor: string;
    tags: string[];
    stats: {
        totalHours: number;
        eventsCompleted: number;
    };
    members: GroupMember[];
    upcomingEvents: GroupUpcomingEvent[];
    activityFeed: GroupActivityPost[];
    // Include other types like GroupMember, GroupUpcomingEvent, etc.
    // ...
}

/**
 * FINAL FIX: GroupBasecampData extends Organization, adding all the UI/Detail fields.
 * This guarantees it has *all* the base fields required by Pinia's state definition.
 */
export interface GroupBasecampData extends Organization, GroupDetailFields {
    // If you need any specific overrides or additions, place them here.
}