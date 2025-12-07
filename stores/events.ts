// stores/events.ts

import { defineStore } from 'pinia';
import type { EventsState, ConnectEvent, VolunteerAttendance } from '../types/event';
import { useAuthStore } from './auth';
import { EventService } from '../services/firestore/events'; // <-- NEW IMPORT

// NOTE: For simplicity, I'm modifying the simulateEventFetch result to include attendees for Event 1.
// NOTE: I'm also changing IDs to be string|number to match the flexible interface
const simulateEventFetch = (): ConnectEvent[] => ([
    { 
        id: 'evt-1', // Changed to string ID for consistency
        title: 'Memorial Park Cleanup', 
        description: 'Help clear winter debris and prep flower beds.', 
        organizationId: 'org-201', // Changed to string ID
        organizationName: 'Keep COS Beautiful', 
        location: { lat: 38.8283, lng: -104.8143 }, 
        date: '2025-03-15', 
        time: '09:00', 
        category: 'Environment', 
        volunteersNeeded: 30, 
        volunteersSignedUp: 1, 
        isMicroProject: false, 
        suppliesNeeded: ['Gloves', 'Shovels'],
        attendees: [
            { volunteerId: 101, volunteerName: 'Erin L.', signedUp: true, checkInTime: '2025-03-15T08:55:00Z', checkOutTime: null, hoursVerified: false, verificationLetterSent: false }
        ]
    },
    // ... other events ...
]);


export const useEventsStore = defineStore('events', {
    state: (): EventsState => ({
        allEvents: [],
        organizationEvents: [],
        isLoading: false,
        activeFilters: {
            category: null,
            timeCommitment: null,
            neighborhoodId: null,
        },
        error: null,
    }),

    getters: {
        filteredEvents: (state) => {
            let events = state.allEvents;
            const filters = state.activeFilters;

            if (filters.category) {
                events = events.filter(e => e.category === filters.category);
            }

            return events;
        },
    },

    actions: {
        async fetchEvents() {
            this.isLoading = true;
            this.error = null;
            try {
                // NOTE: In a real app, this would be EventService.getAll()
                const events = simulateEventFetch();
                this.allEvents = events;
            } catch (e: any) {
                this.error = 'Failed to load events: ' + e.message;
            } finally {
                this.isLoading = false;
            }
        },
        
        /**
         * Fetches events associated with the owned organization.
         */
        async fetchOrganizationEvents(orgId: string | number) {
            this.isLoading = true;
            this.error = null;
            try {
                const events = await EventService.getByOrganizationId(orgId);
                this.organizationEvents = events;
            } catch (e: any) {
                console.error("Failed to load organization events:", e);
                this.error = 'Failed to load your events.';
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Create event and add to local state lists.
         */
        async createEvent(eventData: Omit<ConnectEvent, 'id'>) {
            this.isLoading = true;
            this.error = null;
            
            try {
                const newId = await EventService.create(eventData);
                const newEvent: ConnectEvent = { ...eventData, id: newId };
                
                // 1. Add to general events list
                this.allEvents.unshift(newEvent);
                // 2. Add to organization-specific events list
                this.organizationEvents.unshift(newEvent); 

                return newId;
            } catch (err: any) {
                console.error("Event Creation Error:", err);
                this.error = "Failed to create event.";
                throw err;
            } finally {
                this.isLoading = false;
            }
        },

        // --- ATTENDANCE ACTIONS (Updated to handle string|number IDs) ---

        /**
         * Org Admin action to check-in a volunteer for an event.
         * @param eventId - The ID of the event (string or number).
         * @param volunteerId - The ID of the volunteer being checked in.
         */
        async checkInVolunteer(eventId: string | number, volunteerId: number) {
            // 1. Find the event
            const event = this.allEvents.find(e => e.id === eventId);
            if (!event) return;

            // 2. Find the volunteer's record
            const record = event.attendees.find(a => a.volunteerId === volunteerId);

            if (record && !record.checkInTime) {
                record.checkInTime = new Date().toISOString();
                // TODO: API call to update attendance record on server
                console.log(`Volunteer ${volunteerId} checked IN for Event ${eventId}.`);
            }
        },

        /**
         * Org Admin action to check-out a volunteer and finalize hours.
         * @param eventId - The ID of the event (string or number).
         * @param volunteerId - The ID of the volunteer being checked out.
         */
        async checkOutVolunteer(eventId: string | number, volunteerId: number) {
            const event = this.allEvents.find(e => e.id === eventId);
            const record = event?.attendees.find(a => a.volunteerId === volunteerId);

            if (record && record.checkInTime && !record.checkOutTime) {
                record.checkOutTime = new Date().toISOString();
                record.hoursVerified = true; 
                
                // TODO: API call to update attendance record on server
                console.log(`Volunteer ${volunteerId} checked OUT for Event ${eventId}. Hours Verified.`);
            }
        },

        // --- SERVICE HOUR VERIFICATION ACTION (Updated to handle string|number IDs) ---

        /**
         * Generates and marks the service hour verification letter as sent.
         * @param eventId - The ID of the completed event (string or number).
         * @param volunteerId - The ID of the volunteer needing the letter.
         */
        async generateVerificationLetter(eventId: string | number, volunteerId: number) {
            const event = this.allEvents.find(e => e.id === eventId);
            const record = event?.attendees.find(a => a.volunteerId === volunteerId);

            if (record && record.hoursVerified && !record.verificationLetterSent) {
                const checkIn = new Date(record.checkInTime!);
                const checkOut = new Date(record.checkOutTime!);
                const totalMinutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
                const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

                const letterContent = `... Letter content for ${totalHours} hours ...`;

                // TODO: API call to generate and email/download the PDF based on letterContent
                
                record.verificationLetterSent = true;
                console.log(`Verification letter generated for ${record.volunteerName}: ${totalHours} hours.`);
            }
        },
    },
});