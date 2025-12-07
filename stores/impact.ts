// stores/impact.ts

import { defineStore } from 'pinia';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import type { ImpactState } from '../types/event';
import { useAuthStore } from './auth';
import { useEventsStore } from './events';

export const useImpactStore = defineStore('impact', {
    state: (): ImpactState => ({
        totalHours: 0,
        streakDays: 0,
        impactPoints: 0,
        earnedBadges: [],
        collaboratorList: [],
        neighborhoodRank: 0,
    }),

    getters: {
        // Calculates a completion percentage for a badge based on criteria
        getBadgeProgress: (state) => (badgeName: string): number => {
            if (badgeName === 'Safety Champion') {
                return state.earnedBadges.includes(badgeName) ? 100 : 0;
            }
            return state.earnedBadges.includes(badgeName) ? 100 : 0;
        },

        // Gets the ranking display text
        neighborhoodRankDisplay: (state) => `Rank #${state.neighborhoodRank}`,
    },

    actions: {
        async fetchUserImpact() {
            const authStore = useAuthStore();
            const eventsStore = useEventsStore();
            
            if (!authStore.isLoggedIn || !authStore.profile?.id) return;

            try {
                // 1. Get impact points directly from user profile
                this.impactPoints = authStore.profile?.impactPoints || 0;

                // 2. Fetch user events and calculate hours
                await eventsStore.fetchUserEvents(authStore.profile.id);
                
                let totalHours = 0;
                const orgsSet = new Set<string>();

                eventsStore.userEvents.forEach(event => {
                    if (event.organizationId) {
                        orgsSet.add(event.organizationId);
                    }

                    const record = event.attendees?.find(a => a.volunteerId === authStore.profile?.id);
                    
                    if (record && record.status === 'completed' && record.checkInTime && record.checkOutTime) {
                        const start = new Date(record.checkInTime).getTime();
                        const end = new Date(record.checkOutTime).getTime();
                        const durationMs = end - start;
                        
                        if (durationMs > 0) {
                            const hours = durationMs / (1000 * 60 * 60);
                            totalHours += hours;
                        }
                    }
                });

                this.totalHours = Math.round(totalHours * 10) / 10;

                // 3. Award badges based on hours completed
                this.earnedBadges = [];
                if (this.totalHours >= 5) this.earnedBadges.push('Trail Blazer');
                if (this.totalHours >= 25) this.earnedBadges.push('Safety Champion');
                if (this.totalHours >= 50) this.earnedBadges.push('Youth Advocate');

                // 4. Calculate neighborhood rank (placeholder - would need database query)
                this.neighborhoodRank = Math.floor(Math.random() * 55) + 1;

            } catch (error) {
                console.error('Failed to fetch user impact data:', error);
            }
        },
        
        // Simulates receiving credit for an event completion
        logEventCompletion(hours: number, points: number, badgeAwarded: string | null) {
            this.totalHours += hours;
            this.impactPoints += points;
            
            if (badgeAwarded && !this.earnedBadges.includes(badgeAwarded)) {
                this.earnedBadges.push(badgeAwarded);
            }
        }
    },
});