// stores/orgs.ts

import { defineStore } from "pinia";
import type { OrgState, Organization } from "../types/event";
import { OrgService } from "../services/firestore/orgs";
import { useAuthStore } from "./auth"; // <--- 1. Import Auth Store

// The base URL for the ProPublica API search endpoint
const PROXY_URL = "/api/propublica/organizations";

/**
 * Maps the raw ProPublica organization object to the target Organization interface.
 */
function mapRawToOrganization(rawOrg: any): Organization {
  const einString = rawOrg.ein ? String(rawOrg.ein) : null;

  let organizationType: Organization["type"] = "NonProfit";
  if (rawOrg.name.includes("School")) {
    organizationType = "School";
  } else if (
    rawOrg.name.includes("Association") ||
    rawOrg.name.includes("Neighborhood")
  ) {
    organizationType = "NeighborhoodGroup";
  }

  return {
    id: rawOrg.id,
    ein: einString,
    name: rawOrg.name,
    propublica: true,
    admins: [],
    interests: [], // API orgs have no interests by default, score will be 0
    type: organizationType,
    description: `Tax-Exempt Organization in ${rawOrg.city || "N/A"}, ${
      rawOrg.state || "N/A"
    }. EIN: ${einString}.`,
    contactEmail: "contact@example.org",
    socialLinks: { instagram: null, facebook: null },
  };
}

export const useOrgStore = defineStore("orgs", {
  state: (): OrgState => ({
    allOrganizations: [],
    followedOrganizations: [],
    neighborhoodGroups: [],
    ownedOrganization: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Returns organizations that the current user follows
    followedOrgsList: (state) => {
      return state.allOrganizations.filter((org) => {
        if (typeof org.id === "string") {
          return state.followedOrganizations.includes(org.id);
        }
        return false;
      });
    },

    recommendedOrgs: (state) => {
      const authStore = useAuthStore();
      // 1. Get User Interests
      const userInterests = authStore.profile?.interests || [];
      const totalUserInterests = userInterests.length;

      // If user has no interests, return 0 score for everyone
      if (totalUserInterests === 0) {
        return state.allOrganizations
          .map((org) => ({ org, score: 0 }))
          .sort((a, b) => a.org.name.localeCompare(b.org.name));
      }

      return state.allOrganizations
        .map((org) => {
          const orgInterests = org.interests || [];

          // 2. Count Matches
          const matchCount = orgInterests.filter((tag) =>
            userInterests.includes(tag)
          ).length;

          // 3. Calculate Percentage (0 to 100)
          // Logic: "How much of 'You' is covered by this Org?"
          let percentage = 0;
          if (totalUserInterests > 0) {
            percentage = Math.round((matchCount / totalUserInterests) * 100);
          }

          return { org, score: percentage };
        })
        .sort((a, b) => {
          // Sort by Percentage Score (High to Low)
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.org.name.localeCompare(b.org.name);
        });
    },
  },

  actions: {
    async fetchOrganizations(queryStr: string) {
      this.isLoading = true;
      this.error = null;

      try {
        const [apiResponse, firestoreOrgs] = await Promise.allSettled([
          $fetch(PROXY_URL, { params: { q: queryStr, state: "CO" } }),
          OrgService.getAll(),
        ]);

        let localOrgs: Organization[] = [];
        const localEinSet = new Set<string>();

        if (firestoreOrgs.status === "fulfilled") {
          localOrgs = firestoreOrgs.value;
          for (const org of localOrgs) {
            if (org.ein) localEinSet.add(org.ein);
          }
        } else {
          console.error("Firestore Fetch Failed:", firestoreOrgs.reason);
        }

        let filteredApiOrgs: Organization[] = [];

        if (apiResponse.status === "fulfilled") {
          const rawData: any = apiResponse.value;
          if (rawData && Array.isArray(rawData.organizations)) {
            filteredApiOrgs = rawData.organizations
              .map(mapRawToOrganization)
              .filter((apiOrg: Organization) => {
                return !apiOrg.ein || !localEinSet.has(apiOrg.ein);
              });
          }
        }

        this.allOrganizations = [...localOrgs, ...filteredApiOrgs];

        this.neighborhoodGroups = this.allOrganizations.filter(
          (o) => o.type === "NeighborhoodGroup"
        );
      } catch (e) {
        this.error = "Error loading organizations.";
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOwnedOrganizations(userId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const myOrgs = await OrgService.getById(userId);
        this.ownedOrganization = myOrgs;
      } catch (e) {
        this.error = "Failed to load your organizations.";
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },

    async createOrg(newOrgData: Omit<Organization, "id">) {
      this.isLoading = true;
      try {
        const newId = await OrgService.create(newOrgData);
        const newOrg: Organization = { ...newOrgData, id: newId };
        this.allOrganizations.unshift(newOrg);
        return newId;
      } catch (e) {
        this.error = "Failed to create organization.";
        throw e;
      } finally {
        this.isLoading = false;
      }
    },

    toggleFollowOrg(orgId: string | number) {
      if (typeof orgId !== "string") {
        console.warn(`[OrgStore] Cannot follow numeric ID (${orgId}).`);
        return;
      }

      const idString: string = orgId;
      const index = this.followedOrganizations.indexOf(idString);

      if (index > -1) {
        this.followedOrganizations.splice(index, 1);
      } else {
        this.followedOrganizations.push(idString);
      }
    },
  },
});
