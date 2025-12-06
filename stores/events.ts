// stores/events.ts

import { defineStore } from 'pinia';
import type { EventsState, ConnectEvent } from '../types/event';

// Helper function to simulate fetching data
const simulateEventFetch = (): ConnectEvent[] => ([
    { id: 1, title: 'Memorial Park Cleanup', description: 'Help clear winter debris and prep flower beds.', organizationId: 201, organizationName: 'Keep COS Beautiful', location: { lat: 38.8283, lng: -104.8143 }, date: '2025-03-15', time: '09:00', category: 'Environment', volunteersNeeded: 30, volunteersSignedUp: 12, isMicroProject: false, suppliesNeeded: ['Gloves', 'Shovels'] },
    { id: 2, title: 'CERT Training Session', description: 'Community Emergency Response Team basic training.', organizationId: 202, organizationName: 'COS Fire Department', location: { lat: 38.8411, lng: -104.8193 }, date: '2025-03-22', time: '18:00', category: 'PublicSafety', volunteersNeeded: 20, volunteersSignedUp: 8, isMicroProject: false, suppliesNeeded: ['Notebook'] },
    { id: 3, title: 'Downtown Sidewalk Sweeping', description: 'Quick 1-hour micro-project to clean up a specific block.', organizationId: 203, organizationName: 'Downtown Partnership', location: { lat: 38.8333, lng: -104.8214 }, date: '2025-03-10', time: '11:00', category: 'Environment', volunteersNeeded: 2, volunteersSignedUp: 1, isMicroProject: true, suppliesNeeded: ['Broom'] },
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
            this.isLoading = true;
            this.error = null;
            try {
                // TODO: Replace with actual API call to get all events
                const events = simulateEventFetch();
                this.allEvents = events;
            } catch (e: any) {
                this.error = 'Failed to load events: ' + e.message;
            } finally {
                this.isLoading = false;
            }
        },

        // Action to apply filters from the UI
        setFilter(key: keyof EventsState['activeFilters'], value: string | number | null) {
            this.activeFilters[key] = value as any;
            // The getter 'filteredEvents' automatically updates when state changes
        },
    },
});