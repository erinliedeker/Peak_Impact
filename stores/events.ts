// stores/events.ts

import { defineStore } from 'pinia';
import type { EventsState, ConnectEvent, VolunteerAttendance } from '../types/event';
import { useAuthStore } from './auth'; // Note: Imported but not used in this specific file snippet
import { EventService } from '../services/firestore/events'; // <-- Service is used

// 🚨 REMOVED: The dummy data function 'simulateEventFetch' is no longer needed.
// The data will now come from EventService.getAll().


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
        /**
         * Fetches all events from the Firestore database.
         */
        async fetchEvents() {
            this.isLoading = true;
            this.error = null;
            try {
                // 🚀 CHANGE: Use the real service function to fetch data
                const events = await EventService.getAll();
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

        // --- ATTENDANCE ACTIONS (In-memory updates only, for now) ---

        /**
         * Org Admin action to check-in a volunteer for an event.
         * @param eventId - The ID of the event (string or number).
         * @param volunteerId - The ID of the volunteer being checked in.
         */
        // async checkInVolunteer(eventId: string | number, volunteerId: number) {
        //     const event = this.allEvents.find(e => e.id === eventId);
        //     if (!event) return;

        //     const record = event.attendees.find(a => a.volunteerId === volunteerId);

        //     if (record && !record.checkInTime) {
        //         record.checkInTime = new Date().toISOString();
        //         // TODO: API call to update attendance record on server
        //         console.log(`Volunteer ${volunteerId} checked IN for Event ${eventId}.`);
        //     }
        // },

        /**
         * Org Admin action to check-out a volunteer and finalize hours.
         * @param eventId - The ID of the event (string or number).
         * @param volunteerId - The ID of the volunteer being checked out.
         */
        // async checkOutVolunteer(eventId: string | number, volunteerId: number) {
        //     const event = this.allEvents.find(e => e.id === eventId);
        //     const record = event?.attendees.find(a => a.volunteerId === volunteerId);

        //     if (record && record.checkInTime && !record.checkOutTime) {
        //         record.checkOutTime = new Date().toISOString();
        //         record.hoursVerified = true; 
                
        //         // TODO: API call to update attendance record on server
        //         console.log(`Volunteer ${volunteerId} checked OUT for Event ${eventId}. Hours Verified.`);
        //     }
        // },

        // --- SERVICE HOUR VERIFICATION ACTION ---

        /**
         * Generates and marks the service hour verification letter as sent.
         * @param eventId - The ID of the completed event (string or number).
         * @param volunteerId - The ID of the volunteer needing the letter.
         */
        // async generateVerificationLetter(eventId: string | number, volunteerId: number) {
        //     const event = this.allEvents.find(e => e.id === eventId);
        //     const record = event?.attendees.find(a => a.volunteerId === volunteerId);

        //     if (record && record.hoursVerified && !record.verificationLetterSent) {
        //         const checkIn = new Date(record.checkInTime!);
        //         const checkOut = new Date(record.checkOutTime!);
        //         const totalMinutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
        //         const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

        //         const letterContent = `... Letter content for ${totalHours} hours ...`;

        //         // TODO: API call to generate and email/download the PDF based on letterContent
                
        //         record.verificationLetterSent = true;
        //         console.log(`Verification letter generated for ${record.volunteerName}: ${totalHours} hours.`);
        //     }
        // },
    },
});