// stores/events.ts

import { defineStore } from 'pinia';
import type { EventsState, ConnectEvent, VolunteerAttendance, Attendee } from '../types/event';
import { EventService } from '../services/firestore/events'; 
// NOTE: Assuming UserService exists for fetching user details
import { UserService } from '../services/firestore/users'; 


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
        // --- FETCH ACTIONS ---

        async fetchEvents() {
            this.isLoading = true;
            this.error = null;
            // ... (rest of fetchEvents logic unchanged)
            try {
                const [firestoreResult, mobilizeResult] = await Promise.allSettled([
                    EventService.getAll(),           
                    $fetch('/api/mobilize/events')   
                ]);

                let localEvents: ConnectEvent[] = [];
                if (firestoreResult.status === 'fulfilled') {
                    localEvents = firestoreResult.value;
                } else {
                    console.error("Firestore Error:", firestoreResult.reason);
                    this.error = "Failed to load some local events.";
                }

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
                                time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

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
                            } as unknown as ConnectEvent;
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

                this.allEvents = mergedEvents;
                return mergedEvents;

            } catch (e: any) {
                console.error("Critical Fetch Error:", e);
                this.error = 'Failed to load events: ' + e.message;
                return []; 
            } finally {
                this.isLoading = false;
            }
        },
        
        async fetchOrganizationEvents(orgId: string | number) { // Kept original signature
            this.isLoading = true;
            this.error = null;
            try {
                const events = await EventService.getByOrganizationId(orgId);
                this.organizationEvents = events;
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
         * Fetches detailed attendee list for the Check-In Modal.
         */
        async fetchEventAttendees(eventId: string): Promise<Attendee[]> {
            this.isLoading = true;
            try {
                // 1. Get the raw attendance records
                // Assuming EventService.getById is defined, which we just did
                const event = await (EventService as any).getById(eventId); 
                if (!event || !event.attendees) return [];

                const rawAttendance: VolunteerAttendance[] = event.attendees;
                const volunteerUids = rawAttendance.map(a => a.volunteerId);

                console.log(volunteerUids)
                
                // 2. ⭐️ FETCH USER PROFILES using the new service
                const userProfiles = await UserService.getUsersByUids(volunteerUids); 

                console.log("A", userProfiles)

                // 3. Merge and create the final Attendee list
                const detailedAttendees: Attendee[] = rawAttendance.map((record: VolunteerAttendance) => { 
                    // Find the user profile that matches the attendance record's ID
                    const user = userProfiles.find(u => u.uid === record.volunteerId);

                    return {
                        uid: record.volunteerId,
                        name: user?.name || 'Unknown User',
                        email: user?.email || 'N/A', // Use the fetched email
                        status: record.status, 
                        checkInTime: record.checkInTime,
                        checkOutTime: record.checkOutTime,
                    } as Attendee;
                });

                return detailedAttendees;
            } catch (e) {
                console.error("Failed to fetch attendees:", e);
                return [];
            } finally {
                this.isLoading = false;
            }
        },

        async fetchMyEvents(volunteerId: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const allEvents = await EventService.getAll();
                const myEvents = allEvents.filter(event => 
                    event.attendees.some(att => att.volunteerId === volunteerId));
                return myEvents;
            } catch (e: any) {
                console.error("Failed to load my events:", e);
                this.error = 'Failed to load your events.';
                return [];
            } finally {
                this.isLoading = false;
            }
        },
        // --- CRUD ACTIONS ---

        async createEvent(eventData: Omit<ConnectEvent, 'id'>) {
            this.isLoading = true;
            this.error = null;
            
            try {
                const newId = await EventService.create(eventData);
                const newEvent: ConnectEvent = { 
                    ...eventData, 
                    id: newId,
                    createdAt: new Date().toISOString()
                };
                
                this.allEvents.unshift(newEvent);
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

        /**
         * Updates an existing event (required by dashboard form).
         */
        async updateEvent(eventData: Omit<ConnectEvent, 'attendees' | 'volunteersSignedUp' | 'createdAt'> & { id: string }) {
            this.isLoading = true;
            this.error = null;
            
            try {
                await EventService.update(eventData.id, eventData);
                
                const updateLocalList = (list: ConnectEvent[]) => {
                    const index = list.findIndex(e => e.id === eventData.id);
                    if (index !== -1) {
                        // ⭐️ FIX 3: Preserve required fields from existing object
                        list[index] = { ...list[index], ...eventData } as ConnectEvent;
                    }
                };

                updateLocalList(this.organizationEvents);
                updateLocalList(this.allEvents);

            } catch (err: any) {
                console.error("Event Update Error:", err);
                this.error = "Failed to update event.";
                throw err;
            } finally {
                this.isLoading = false;
            }
        },
        
        // --- ATTENDANCE ACTIONS ---

        async signUpVolunteer(eventId: string, volunteer: VolunteerAttendance) {
            const event = this.allEvents.find(e => e.id === eventId);
            if (!event) return;

            event.attendees.push(volunteer);
            event.volunteersSignedUp = (event.volunteersSignedUp || 0) + 1;

            try {
                await EventService.update(eventId, { 
                    attendees: event.attendees,
                    volunteersSignedUp: event.volunteersSignedUp 
                });
            } catch (err) {
                console.error("Failed to sign up volunteer", err);
            }
        },

        /**
         * Org Admin action to check-in a volunteer.
         */
        async checkInVolunteer(eventId: string, volunteerId: string) { // ⭐️ Fixed type to string
            const event = this.allEvents.find(e => e.id === eventId);
            if (!event) return;

            const record = event.attendees.find(a => a.volunteerId === volunteerId);

            // Check that the record exists and status is 'registered'
            if (record && record.status === 'registered') { 
                record.checkInTime = new Date().toISOString();
                record.status = 'checked-in'; // Set new status
                
                await EventService.updateAttendees(String(eventId), event.attendees);
            }
        },

        /**
         * Org Admin action to check-out a volunteer.
         */
        async checkOutVolunteer(eventId: string, volunteerId: string) { // ⭐️ Fixed type to string
            const event = this.allEvents.find(e => e.id === eventId);
            if (!event) return;

            const record = event.attendees.find(a => a.volunteerId === volunteerId);

            // Check that record exists, has checked in, and status is 'checked-in'
            if (record && record.checkInTime && record.status === 'checked-in') { 
                record.checkOutTime = new Date().toISOString();
                record.hoursVerified = true; 
                record.status = 'completed'; // Set new status
                
                await EventService.updateAttendees(String(eventId), event.attendees);
            }
        },

        /**
         * Generates verification letter (Updates status).
         */
        async generateVerificationLetter(eventId: string, volunteerId: string) { // ⭐️ Fixed type to string
            const event = this.allEvents.find(e => e.id === eventId);
            const record = event?.attendees.find(a => a.volunteerId === volunteerId);

            if (record && record.hoursVerified && !record.verificationLetterSent) {
                // ... (logic)
                record.verificationLetterSent = true;
                await EventService.updateAttendees(String(eventId), event!.attendees);
            }
        },
    },
});