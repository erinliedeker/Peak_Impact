import { defineStore } from "pinia";
// Assuming you have a specific type for local groups, 
// but we'll use Organization as a base for now, assuming a shared structure.
import type { OrgState, Organization as Group, Organization } from "../types/event"; 
// Assuming a dedicated service for groups exists
import { GroupService } from "../services/firestore/groups"
import { useAuthStore } from "./auth"; 
import { UserService } from "~~/services/firestore/users";
import type { GroupActivityPost, GroupMember, GroupUpcomingEvent } from "~~/types/group";

export interface GroupDetailFields {
    location: string;
    description: string; // The base type has a description, but we include it here for clarity
    bannerUrl: string;
    themeColor: string;
    tags: string[];
    stats: {
        totalHours: number;
        eventsCompleted: number;
    };
    members: GroupMember[];
    upcomingEvents: GroupUpcomingEvent[];
    activityFeed: GroupActivityPost[];
}

export interface GroupBasecampData extends Organization, GroupDetailFields {
}

/**
 * Interface for the Group-specific state. 
 */
interface GroupState {
    allNeighborhoodGroups: Group[];
    isLoading: boolean;
    error: string | null;
}

export const useGroupsStore = defineStore("groups", {
    state: (): GroupState => ({
        allNeighborhoodGroups: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        /**
         * Returns all neighborhood groups sorted alphabetically.
         */
        sortedGroups(state): Group[] {
            return state.allNeighborhoodGroups.sort((a, b) => 
                a.name.localeCompare(b.name)
            );
        },
        
        /**
         * Returns a list of groups that the current user has JOINED.
         * CORRECTION: Renamed getter from followedGroups to joinedGroups.
         * CORRECTION: Reads from authStore.profile?.joinedGroups.
         */
        joinedGroups(state): Group[] {
            const authStore = useAuthStore();
            // 🎯 CORRECTED: Reading from 'joinedGroups'
            const joinedIds = authStore.profile?.joinedGroups || []; 

            return state.allNeighborhoodGroups.filter(group => {
                if (typeof group.id === "string") {
                    return joinedIds.includes(group.id);
                }
                return false;
            });
        }
    },

    actions: {

        /**
         * Creates a new group and adds it to the list of all neighborhood groups.
         * @param newGroupPayload Object containing all necessary group setup data.
         */
        async createGroup(newGroupPayload: { name: string; description: string; type: string, [key: string]: any }): Promise<GroupBasecampData | null> {
            this.isLoading = true;
            this.error = null;
            
            const authStore = useAuthStore();
            const adminId = authStore.profile?.id;

            if (!adminId) {
                this.error = "Admin ID not found. User must be logged in to create a group.";
                this.isLoading = false;
                return null;
            }

            try {
                // Call the service to save the data to the backend
                const newGroup = await GroupService.createGroup(newGroupPayload, adminId);
                
                // Update the Pinia state by adding the new group to the list
                this.allNeighborhoodGroups.push(newGroup);

                // 🎯 FIX 1: Ensure the ID is cast to a string when checking/pushing into string[]
                const newGroupIdString = String(newGroup.id);

                // Since the creator automatically joins, also update the AuthStore state
                const currentJoined = authStore.profile?.joinedGroups || [];
                
                // Note: authStore.profile?.joinedGroups is a string[]
                if (authStore.profile && !currentJoined.includes(newGroupIdString)) { 
                    // 🎯 FIX 2: Push the string version
                    authStore.profile.joinedGroups.push(newGroupIdString);
                }

                // The variable `newGroup` still maintains its type of GroupBasecampData
                return newGroup; // No change needed here, the type is correct.
                
            } catch (e: any) {
                this.error = "Failed to create new group.";
                console.error(e);
                return null;
            } finally {
                this.isLoading = false;
            }
        },

        async getGroupById(groupId: string): Promise<GroupBasecampData | null> {
            try {
                // Call the service method which uses GroupService.getById()
                const group = await GroupService.getById(groupId);
                
                // Optionally, you could cache this group in the store, but for now, 
                // we'll just return the fetched data.
                return group; 
            } catch (e) {
                console.error(`Failed to fetch group ${groupId}:`, e);
                return null;
            }
        },

        /**
         * Fetches all local Neighborhood Groups from the dedicated service.
         */
        async fetchNeighborhoodGroups() {
            this.isLoading = true;
            this.error = null;

            if (typeof window === 'undefined') { 
                // Logic to fetch data directly via service, not via VueFire binding
                // Use GroupService.getAll() which does a one-time fetch (like getDocs)
                
                this.allNeighborhoodGroups = await GroupService.getAll();
                
                // Return without setting up the reactive listener (useFirestore)
                return;
            }

            try {
                // Fetch groups using the dedicated GroupService
                const groups = await GroupService.getAll(); 
                
                // Filter to ensure only true "Group" types are included, 
                // assuming the service might return mixed types.
                this.allNeighborhoodGroups = groups.filter(
                    (g: Group) => g.type === "NeighborhoodGroup" || g.type === "School"
                );

            } catch (e: any) {
                this.error = "Error loading neighborhood groups.";
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        },

        async toggleJoinGroup(groupId: string | number): Promise<void> {
            const authStore = useAuthStore();
            const idString: string = String(groupId);
            
            if (!authStore.profile || !authStore.profile.id) {
                console.warn("[GroupsStore] Cannot join group: User profile not loaded.");
                throw new Error("User not authenticated.");
            }
            
            // 🎯 NEW: Create local constants for clean, non-null access
            const profile = authStore.profile; 
            const userId = profile.id;
            
            // Now you can safely use profile.joinedGroups as it is checked above.
            const currentJoined = profile.joinedGroups || []; 
            const isCurrentlyMember = currentJoined.includes(idString);
            
            let newJoinedGroups: string[];
            let groupAction: 'join' | 'leave';
            
            if (isCurrentlyMember) {
                // Leave the group
                newJoinedGroups = currentJoined.filter(id => id !== idString);
                groupAction = 'leave';
            } else {
                // Join the group
                newJoinedGroups = [...currentJoined, idString];
                groupAction = 'join';
            }

            try {
                // OPTIMISTIC UPDATE: The profile is guaranteed not to be null here
                // as it passed the check above.
                authStore.profile.joinedGroups = newJoinedGroups; 

                // 1. Update the Group Document (GroupService)
                if (groupAction === 'join') {
                    await GroupService.joinGroup(idString, userId);
                } else {
                    await GroupService.leaveGroup(idString, userId);
                }

                // 2. Update the User's Profile Document (UserService)
                await UserService.updateUserJoinedGroups(userId, newJoinedGroups);

            } catch (e) {
                // REVERT: If the transaction failed, revert the state back to the original value
                profile.joinedGroups = currentJoined; // Use the non-null profile constant
                this.error = `Failed to ${groupAction} group.`;
                console.error(e);
                throw e;
            }
        },
    },
});