// stores/impact.ts

import { defineStore } from 'pinia';
import type { ImpactState } from '../types/event';
// Assuming useAuthStore is needed to get the current user ID
import { useAuthStore } from './auth';

export const useImpactStore = defineStore('impact', {
    state: (): ImpactState => ({
        totalHours: 45,
        streakDays: 7,
        impactPoints: 450,
        earnedBadges: ['Trail Blazer', 'Safety Champion', 'Youth Advocate'],
        collaboratorList: [
            { name: 'Alex Johnson', eventsCount: 5 },
            { name: 'City Staffer', eventsCount: 3 },
            { name: 'Sarah M.', eventsCount: 3 },
        ],
        neighborhoodRank: 3, // Out of 55 neighborhoods
    }),

    getters: {
        // Calculates a completion percentage for a badge based on criteria (can be complex)
        getBadgeProgress: (state) => (badgeName: string): number => {
            if (badgeName === 'Safety Champion') {
                // Logic: Need 2 Public Safety events. Assume user has 1/2 (50%)
                return 50; 
            }
            return state.earnedBadges.includes(badgeName) ? 100 : 0;
        },

        // Gets the ranking display text
        neighborhoodRankDisplay: (state) => `Rank #${state.neighborhoodRank}`,
    },

    actions: {
        async fetchUserImpact() {
            const authStore = useAuthStore();
            if (!authStore.isLoggedIn) return;

            // TODO: Replace with API call to get impact data for authStore.profile.id
            // Simulating update from API
            this.totalHours = authStore.profile?.impactPoints ? Math.floor(authStore.profile.impactPoints / 10) : 0;
            this.impactPoints = authStore.profile?.impactPoints || 0;
        },
        
        // Simulates receiving credit for an event completion
        logEventCompletion(hours: number, points: number, badgeAwarded: string | null) {
            this.totalHours += hours;
            this.impactPoints += points;
            
            if (badgeAwarded && !this.earnedBadges.includes(badgeAwarded)) {
                this.earnedBadges.push(badgeAwarded);
            }
            // TODO: API call to update server
        }
    },
});