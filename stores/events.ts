// stores/events.ts

import { defineStore } from 'pinia';
import type { EventsState, ConnectEvent, VolunteerAttendance } from '../types/event';
import { EventService } from '../services/firestore/events'; // <-- Service is used

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
                // 1. Run both fetches in parallel
                // We use allSettled so if one fails (e.g. API down), the other still loads.
                const [firestoreResult, mobilizeResult] = await Promise.allSettled([
                    EventService.getAll(),           // Your existing Firestore Service
                    $fetch('/api/mobilize/events')   // Your new Nuxt Proxy
                ]);

                // 2. Process Firestore Data
                let localEvents: ConnectEvent[] = [];
                if (firestoreResult.status === 'fulfilled') {
                    localEvents = firestoreResult.value;
                } else {
                    console.error("Firestore Error:", firestoreResult.reason);
                    this.error = "Failed to load some local events.";
                }

                // 3. Process Mobilize Data
                let externalEvents: ConnectEvent[] = [];
                if (mobilizeResult.status === 'fulfilled') {
                    const response: any = mobilizeResult.value;
                    
                    // Check if response.data exists (Mobilize format)
                    if (response?.data && Array.isArray(response.data)) {
                        externalEvents = response.data.map((mEvent: any) => {
                            // Map Mobilize JSON to ConnectEvent interface
                            const nextTimeslot = mEvent.timeslots?.[0];
                            const startTime = nextTimeslot ? new Date(nextTimeslot.start_date * 1000) : new Date();

                            return {
                                // Prefix ID to prevent collisions with Firestore IDs
                                id: `mobilize-${mEvent.id}`, 
                                title: mEvent.title,
                                description: mEvent.description || mEvent.summary,
                                category: 'Social', // Default category (Mobilize tags are unstructured)
                                
                                // Mobilize gives a string or object for venue. We map it to string for display.
                                // Note: Ensure your UI handles `location` as (GeoLocation | string)
                                location: mEvent.location?.venue || 'Virtual/Online',
                                
                                date: startTime.toISOString(),
                                start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                end: null,
                                
                                // Flag as external
                                isExternal: true,
                                externalUrl: mEvent.browser_url,
                                imageUrl: mEvent.featured_image_url || undefined,

                                // Defaults for required internal fields
                                organizationId: 'mobilize-us',
                                organizationName: mEvent.sponsor?.name || 'Mobilize Partner',
                                volunteersNeeded: 100, // Arbitrary default
                                volunteersSignedUp: 0,
                                isMicroProject: false,
                                suppliesNeeded: [],
                                attendees: [],
                                createdAt: new Date(mEvent.created_date * 1000).toISOString()
                            } as ConnectEvent;
                        });
                    }
                } else {
                    console.error("Mobilize API Error:", mobilizeResult.reason);
                    // We don't block the UI if external events fail
                }

                // 4. Merge and Sort by Date (Nearest date first)
                const mergedEvents = [...localEvents, ...externalEvents].sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return dateA - dateB;
                });

                // 5. Update State
                this.allEvents = mergedEvents;

                // 6. Return Data
                return mergedEvents;

            } catch (e: any) {
                console.error("Critical Fetch Error:", e);
                this.error = 'Failed to load events: ' + e.message;
                return []; 
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

                // ✅ Return here as well for consistency
                return events;
            } catch (e: any) {
                console.error("Failed to load organization events:", e);
                this.error = 'Failed to load your events.';
                return [];
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
                // Create a local object to update UI immediately
                // Note: We use the helper logic logic from the service if we need a safe object,
                // but simpler is fine here for immediate UI feedback.
                const newEvent: ConnectEvent = { 
                    ...eventData, 
                    id: newId,
                    createdAt: new Date().toISOString() // Fallback for local display
                };
                
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
        async signUpVolunteer(eventId: string, volunteer: VolunteerAttendance) {
            const event = this.allEvents.find(e => e.id === eventId);
            if (!event) return;

            // 1. Add to local state
            event.attendees.push(volunteer);
            event.volunteersSignedUp = (event.volunteersSignedUp || 0) + 1;

            // 2. Persist to Firestore
            try {
                // Update the array AND the count
                await EventService.update(eventId, { 
                    attendees: event.attendees,
                    volunteersSignedUp: event.volunteersSignedUp 
                });
            } catch (err) {
                console.error("Failed to sign up volunteer", err);
                // Optional: Revert local state on error
            }
        },

        /**
         * Org Admin action to check-in a volunteer.
         */
        async checkInVolunteer(eventId: string, volunteerId: number) {
            const event = this.allEvents.find(e => e.id === eventId);
            if (!event) return;

            const record = event.attendees.find(a => a.volunteerId === volunteerId);

            if (record && !record.checkInTime) {
                // 1. Update local state
                record.checkInTime = new Date().toISOString();
                
                // 2. Persist to Firestore
                console.log(`Saving Check-In for ${volunteerId}...`);
                await EventService.updateAttendees(String(eventId), event.attendees);
            }
        },

        /**
         * Org Admin action to check-out a volunteer.
         */
        async checkOutVolunteer(eventId: string, volunteerId: number) {
            const event = this.allEvents.find(e => e.id === eventId);
            if (!event) return;

            const record = event.attendees.find(a => a.volunteerId === volunteerId);

            if (record && record.checkInTime && !record.checkOutTime) {
                // 1. Update local state
                record.checkOutTime = new Date().toISOString();
                record.hoursVerified = true; 
                
                // 2. Persist to Firestore
                console.log(`Saving Check-Out for ${volunteerId}...`);
                await EventService.updateAttendees(String(eventId), event.attendees);
            }
        },

        /**
         * Generates verification letter (Updates status).
         */
        async generateVerificationLetter(eventId: string, volunteerId: number) {
            const event = this.allEvents.find(e => e.id === eventId);
            const record = event?.attendees.find(a => a.volunteerId === volunteerId);

            if (record && record.hoursVerified && !record.verificationLetterSent) {
                // 1. Logic to generate letter (omitted for brevity)
                const checkIn = new Date(record.checkInTime!);
                const checkOut = new Date(record.checkOutTime!);
                const totalHours = ((checkOut.getTime() - checkIn.getTime()) / 3600000).toFixed(1);
                
                console.log(`Generated letter for ${totalHours} hours.`);

                // 2. Update status
                record.verificationLetterSent = true;

                // 3. Persist to Firestore
                await EventService.updateAttendees(String(eventId), event!.attendees);
            }
        },
    },
});