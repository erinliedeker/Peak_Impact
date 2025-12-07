import { defineStore } from 'pinia';
import type { EventsState, ConnectEvent, VolunteerAttendance } from '../types/event';
import { useAuthStore } from './auth'; // Needed to get the current user's ID/Name

// ... (simulateEventFetch helper function remains, but should now include attendees data)
// NOTE: For simplicity, I'm modifying the simulateEventFetch result to include attendees for Event 1.
const simulateEventFetch = (): ConnectEvent[] => ([
    { 
        id: 1, 
        title: 'Memorial Park Cleanup', 
        description: 'Help clear winter debris and prep flower beds.', 
        organizationId: 201, 
        organizationName: 'Keep COS Beautiful', 
        location: { lat: 38.8283, lng: -104.8143 }, 
        date: '2025-03-15', 
        time: '09:00', 
        category: 'Environment', 
        volunteersNeeded: 30, 
        volunteersSignedUp: 1, 
        isMicroProject: false, 
        suppliesNeeded: ['Gloves', 'Shovels'],
        // NEW ATTENDEE DATA
        attendees: [
            { volunteerId: 101, volunteerName: 'Erin L.', signedUp: true, checkInTime: '2025-03-15T08:55:00Z', checkOutTime: null, hoursVerified: false, verificationLetterSent: false }
        ]
    },
    // ... other events ...
]);

export const useEventsStore = defineStore('events', {
    state: (): EventsState => ({
        allEvents: [],
        isLoading: false,
        activeFilters: {
            category: null,
            timeCommitment: null,
            neighborhoodId: null,
        },
        error: null,
    }),

    getters: {
        // Returns the filtered list of events based on activeFilters
        filteredEvents: (state) => {
            let events = state.allEvents;
            const filters = state.activeFilters;

            // TODO: Add complex filtering logic here

            if (filters.category) {
                events = events.filter(e => e.category === filters.category);
            }
            // Add more filters as needed (e.g., isMicroProject)

            return events;
        },
    },

    actions: {
        async fetchEvents() {
            // ... (existing logic) ...
            this.isLoading = true;
            this.error = null;
            try {
                const events = simulateEventFetch();
                this.allEvents = events;
            } catch (e: any) {
                this.error = 'Failed to load events: ' + e.message;
            } finally {
                this.isLoading = false;
            }
        },

        // --- NEW ORG ADMIN ACTIONS ---

        /**
         * Org Admin action to check-in a volunteer for an event.
         * @param eventId - The ID of the event.
         * @param volunteerId - The ID of the volunteer being checked in.
         */
        async checkInVolunteer(eventId: number, volunteerId: number) {
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
         * @param eventId - The ID of the event.
         * @param volunteerId - The ID of the volunteer being checked out.
         */
        async checkOutVolunteer(eventId: number, volunteerId: number) {
            const event = this.allEvents.find(e => e.id === eventId);
            const record = event?.attendees.find(a => a.volunteerId === volunteerId);

            if (record && record.checkInTime && !record.checkOutTime) {
                record.checkOutTime = new Date().toISOString();
                record.hoursVerified = true; // Hours are verified upon successful check-out
                
                // TODO: API call to update attendance record on server
                // This API call should also trigger an update to the user's Impact Store points/hours!
                console.log(`Volunteer ${volunteerId} checked OUT for Event ${eventId}. Hours Verified.`);
            }
        },

        // --- NEW SERVICE HOUR VERIFICATION ACTION ---

        /**
         * Generates and marks the service hour verification letter as sent.
         * @param eventId - The ID of the completed event.
         * @param volunteerId - The ID of the volunteer needing the letter.
         */
        async generateVerificationLetter(eventId: number, volunteerId: number) {
            const event = this.allEvents.find(e => e.id === eventId);
            const record = event?.attendees.find(a => a.volunteerId === volunteerId);

            if (record && record.hoursVerified && !record.verificationLetterSent) {
                // 1. Calculate final hours
                const checkIn = new Date(record.checkInTime!);
                const checkOut = new Date(record.checkOutTime!);
                // Calculates total minutes difference
                const totalMinutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
                const totalHours = Math.round(totalMinutes / 60 * 10) / 10; // Rounded to one decimal

                // 2. **Auto-Generate Letter Content (Simulation)**
                const letterContent = `
                    TO WHOM IT MAY CONCERN,

                    This letter verifies that ${record.volunteerName} completed 
                    ${totalHours} hours of community service for the event "${event!.title}" 
                    on ${event!.date}.

                    Verified by: ${event!.organizationName}
                `;

                // TODO: API call to generate and email/download the PDF based on letterContent
                
                record.verificationLetterSent = true;
                console.log(`Verification letter generated for ${record.volunteerName}: ${totalHours} hours.`);
            }
        },
    },
});