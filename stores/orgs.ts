// stores/orgs.ts

import { defineStore } from 'pinia';
import type { OrgState, Organization } from '../types/event';

// Helper function to simulate fetching data
const simulateOrgFetch = (): Organization[] => ([
    { id: 201, name: 'Keep COS Beautiful', type: 'NonProfit', description: 'Dedicated to city environment.', contactEmail: 'clean@kcos.org', socialLinks: { instagram: '@kcos_beautiful', facebook: 'kcos_page' } },
    { id: 202, name: 'COS Fire Department', type: 'CityDept', description: 'Public safety and fire mitigation.', contactEmail: 'fire@cos.gov', socialLinks: { instagram: null, facebook: 'COSFireDept' } },
    { id: 301, name: 'Old North End Association', type: 'NeighborhoodGroup', description: 'Serving the ONE neighborhood.', contactEmail: 'one@group.com', socialLinks: { instagram: null, facebook: 'ONEA' } },
]);

export const useOrgStore = defineStore('orgs', {
    state: (): OrgState => ({
        allOrganizations: [],
        followedOrganizations: [201], // User is following Keep COS Beautiful
        neighborhoodGroups: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        // Returns organizations that the current user follows
        followedOrgsList: (state) => {
            return state.allOrganizations.filter(org => state.followedOrganizations.includes(org.id));
        },
    },

    actions: {
        async fetchOrganizations() {
            this.isLoading = true;
            this.error = null;
            try {
                // TODO: Replace with actual API call
                const orgs = simulateOrgFetch();
                this.allOrganizations = orgs;
                // Simple logic to separate neighborhood groups for display
                this.neighborhoodGroups = orgs.filter(o => o.type === 'NeighborhoodGroup');
            } catch (e: any) {
                this.error = 'Failed to load organizations.';
            } finally {
                this.isLoading = false;
            }
        },

        toggleFollowOrg(orgId: number) {
            const index = this.followedOrganizations.indexOf(orgId);
            if (index > -1) {
                this.followedOrganizations.splice(index, 1); // Unfollow
            } else {
                this.followedOrganizations.push(orgId); // Follow
            }
            // TODO: API call to update the user's followed list on the server
        }
    },
});