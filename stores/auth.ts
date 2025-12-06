import { defineStore } from 'pinia';
import type { UserProfile, AuthState } from '../types/user';

// 4. Define and Export the Auth Store
export const useAuthStore = defineStore('auth', {
  // --- State: The single source of truth ---
  state: (): AuthState => ({
    isLoggedIn: false,
    authToken: null,
    profile: null,
    loading: false,
    error: null,
  }),

  // --- Getters: Computed properties for state ---
  getters: {
    // Quickly check if the user is an Organization Administrator
    isOrgAdmin: (state) => state.profile?.userType === 'OrgAdmin',

    // Gets the user's name or defaults to 'Guest'
    userName: (state) => state.profile?.name || 'Guest',

    // Gets the user's current impact points
    currentImpactPoints: (state) => state.profile?.impactPoints || 0,
  },

  // --- Actions: Methods used to modify the state (and handle API calls) ---
  actions: {
    /**
     * Simulates a user logging in via an API call.
     * @param email - The user's email or username.
     * @param password - The user's password.
     */
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;

      try {
        // --- TODO: REPLACE THIS WITH ACTUAL API CALL ---
        // const response = await fetch('/api/login', { method: 'POST', body: { email, password } });
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.message || 'Login failed');
        // --- END TODO ---

        // Simulated successful response data:
        const simulatedToken = 'fake-jwt-token-12345';
        const simulatedProfile: UserProfile = {
          id: 101,
          name: 'Erin L.',
          email: email,
          userType: (email.includes('org')) ? 'OrgAdmin' : 'Resident', // Logic to determine type
          neighborhoodId: 5,
          impactPoints: 450,
        };

        this.authToken = simulatedToken;
        this.profile = simulatedProfile;
        this.isLoggedIn = true;

        // Optional: Persist token (e.g., using Nuxt's built-in cookie utility or a dedicated library)
        // You would typically use a library like Nuxt-Auth or Pinia-Plugin-Persistedstate for this.

      } catch (e: any) {
        this.error = e.message || 'An unknown error occurred during login.';
        this.isLoggedIn = false;
        this.profile = null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clears the user session and state.
     */
    logout() {
      this.authToken = null;
      this.profile = null;
      this.isLoggedIn = false;
      this.error = null;

      // Optional: Remove token from persistence (cookies/localStorage)
    },

    /**
     * Checks if a user is authorized for a specific role (useful for middleware/guards).
     * @param requiredType - The userType required ('OrgAdmin', 'Student', etc.)
     */
    hasRole(requiredType: UserProfile['userType']): boolean {
      return this.profile?.userType === requiredType;
    }
  },
});
