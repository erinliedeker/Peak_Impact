// stores/orgs.ts

import { defineStore } from "pinia";
import type { OrgState, Organization } from "../types/event";
import { OrgService } from "../services/firestore/orgs";

// The base URL for the ProPublica API search endpoint
const PROXY_URL = "/api/propublica/organizations";

const DEFAULT_PAGE = 0;

/**
 * Maps the raw ProPublica organization object to the target Organization interface.
 * Fills in available data and uses safe defaults for unavailable fields.
 * NOTE: The raw object from the search endpoint has fields like 'city', 'state', etc.
 */
function mapRawToOrganization(rawOrg: any): Organization {
  // ProPublica EIN is often an integer in the search results, convert to string.
  const einString = rawOrg.ein ? String(rawOrg.ein) : null;

  // The `type` field is not directly available and is based on a complex
  // code (like ntee_code), so we default it or infer it simply.
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
    // --- Available Data (Mapped) ---
    // ProPublica provides a unique ID (integer) and EIN (integer/string)
    id: rawOrg.id,
    ein: einString,
    name: rawOrg.name,
    propublica: true,

    // --- Unavailable Data (Defaulted/Constructed) ---
    admins: [] as string[],
    type: organizationType,
    description: `Tax-Exempt Organization in ${rawOrg.city || "N/A"}, ${
      rawOrg.state || "N/A"
    }. EIN: ${einString}.`,
    contactEmail: "contact@example.org", // Requires detailed lookup
    socialLinks: {
      // Requires detailed lookup
      instagram: null,
      facebook: null,
    },
  };
}

// --- Pinia Store Definition ---
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
        // Check if org.id is a string AND is included in the followed list.
        // This implicitly filters out the ProPublica orgs (id: number)
        // even if they exist in allOrganizations.
        if (typeof org.id === "string") {
          return state.followedOrganizations.includes(org.id);
        }
        return false;
      });
    },
  },

  actions: {
    async fetchOrganizations(queryStr: string) {
      this.isLoading = true;
      this.error = null;

      try {
        // 1. Parallel Fetch: Trigger both requests at the same time
        const [apiResponse, firestoreOrgs] = await Promise.allSettled([
          $fetch(PROXY_URL, { params: { q: queryStr, state: "CO" } }),
          OrgService.getAll(),
        ]);

        let localOrgs: Organization[] = [];
        // ⚡ Optimization: Create a Set for O(1) instant lookup
        const localEinSet = new Set<string>();

        // 2. Process Firestore Results (Priority Data)
        if (firestoreOrgs.status === "fulfilled") {
          localOrgs = firestoreOrgs.value;

          // Populate the Set with existing EINs
          for (const org of localOrgs) {
            if (org.ein) {
              localEinSet.add(org.ein);
            }
          }
        } else {
          console.error("Firestore Fetch Failed:", firestoreOrgs.reason);
        }

        let filteredApiOrgs: Organization[] = [];

        // 3. Process API Results & Filter
        if (apiResponse.status === "fulfilled") {
          const rawData: any = apiResponse.value;

          if (rawData && Array.isArray(rawData.organizations)) {
            filteredApiOrgs = rawData.organizations
              .map(mapRawToOrganization) // Convert to your Interface first
              .filter((apiOrg: Organization) => {
                // ⚡ Logic: Exclude if EIN exists in our local Set
                // If apiOrg has no EIN, we keep it (safe default)
                return !apiOrg.ein || !localEinSet.has(apiOrg.ein);
              });
          }
        }

        // 4. Update State: Local Orgs + Non-Duplicate API Orgs
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
        // Use the existing service method
        const myOrgs = await OrgService.getById(userId);
        
        // Update state
        this.ownedOrganization = myOrgs;
      } catch (e) {
        this.error = "Failed to load your organizations.";
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Action to Create a new Organization
     */
    async createOrg(newOrgData: Omit<Organization, "id">) {
      this.isLoading = true;
      try {
        // Call the service layer
        const newId = await OrgService.create(newOrgData);

        // Optimistically update the UI (add to local list immediately)
        const newOrg: Organization = { ...newOrgData, id: newId };
        this.allOrganizations.unshift(newOrg); // Add to top of list

        return newId;
      } catch (e) {
        this.error = "Failed to create organization.";
        throw e;
      } finally {
        this.isLoading = false;
      }
    },

    toggleFollowOrg(orgId: string | number) {
      // --- 🔒 VALIDATION: Check if the ID is a string (Firestore ID) ---
      if (typeof orgId !== "string") {
        console.warn(
          `[OrgStore] Cannot follow organization with numeric ID (${orgId}). Must be a Firestore string ID.`
        );
        // Optional: You could throw an error here, but console.warn is sufficient
        // if you control the UI to only show the follow button for Firestore orgs.
        return;
      }

      const idString: string = orgId; // TypeScript now knows this is a string

      const index = this.followedOrganizations.indexOf(idString);
      if (index > -1) {
        this.followedOrganizations.splice(index, 1); // Unfollow
      } else {
        this.followedOrganizations.push(idString); // Follow
      }

      // TODO: API call to update the user's followed list on the server
    },
  },
});

// // Helper function to simulate fetching data
// const simulateOrgFetch = (): Organization[] => ([
//     { id: 201, name: 'Keep COS Beautiful', type: 'NonProfit', description: 'Dedicated to city environment.', contactEmail: 'clean@kcos.org', socialLinks: { instagram: '@kcos_beautiful', facebook: 'kcos_page' } },
//     { id: 202, name: 'COS Fire Department', type: 'CityDept', description: 'Public safety and fire mitigation.', contactEmail: 'fire@cos.gov', socialLinks: { instagram: null, facebook: 'COSFireDept' } },
//     { id: 301, name: 'Old North End Association', type: 'NeighborhoodGroup', description: 'Serving the ONE neighborhood.', contactEmail: 'one@group.com', socialLinks: { instagram: null, facebook: 'ONEA' } },
// ]);
