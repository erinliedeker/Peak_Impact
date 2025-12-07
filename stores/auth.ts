import { defineStore } from 'pinia';
import {
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import type { UserProfile, AuthState } from '../types/user';

// Nuxt composables for Firebase and general utils
// NOTE: These must be imported from 'nuxt' or auto-imported in a Nuxt context.
// For simplicity in a store file, you can rely on Nuxt's auto-imports:
const auth = useFirebaseAuth(); // Gets the Firebase Auth instance
const nuxtApp = useNuxtApp(); // Used to access $firebase
const router = useRouter(); // For redirects

// 4. Define and Export the Auth Store
export const useAuthStore = defineStore('auth', {
  // --- State: The single source of truth ---
  state: (): AuthState => {
    console.log('[Auth Store] Initializing state...');
    return {
      // isLoggedIn will be managed by the listener
      isLoggedIn: false,
      // authToken will hold the Firebase ID token
      authToken: null,
      // profile will hold the custom user data
      profile: null,
      loading: false, // For login/logout actions
      error: null,
      // New: Tracks if the initial auth check has completed
      isAuthInitialized: false,
    };
  },

  // --- Getters: Computed properties for state ---
  getters: {
    isAuthenticated: (state) => {
      // console.log(`[Auth Store] Getter isAuthenticated: ${state.isLoggedIn}`);
      return state.isLoggedIn;
    },

    isOrgAdmin: (state) => state.profile?.userType === 'OrgAdmin',

    userName: (state) => state.profile?.name || 'Guest',

    currentImpactPoints: (state) => state.profile?.impactPoints || 0,
  },

  // --- Actions: Methods used to modify the state (and handle API calls) ---
  actions: {
    /**
     * Helper to fetch the custom profile data from Firestore/API after Firebase login.
     * @param uid - The Firebase User's UID.
     */
    async fetchUserProfile(uid: string) {
      console.log(`[Auth Store] Fetching profile for UID: ${uid}`);
      
      // Simulated custom profile fetch based on UID:
      const simulatedProfile: UserProfile = {
          id: 101, // Custom DB ID
          name: 'Erin L.',
          email: 'erin.l@example.com', // Firebase User data
          userType: (uid.includes('org')) ? 'OrgAdmin' : 'Resident', // Logic based on some criteria
          neighborhoodId: 5,
          impactPoints: 450,
        };
      
      this.profile = simulatedProfile;
      console.log(`[Auth Store] Profile fetched and set for user: ${this.profile.name}`);
    },

    /**
     * Initializes the Firebase Auth listener and synchronizes Pinia state.
     */
    initializeAuth() {
      console.log('[Auth Store] Initializing Firebase Auth listener...');
      const firebaseUser = useCurrentUser();

      // Watch the reactive firebaseUser and update the store's state
      watch(firebaseUser, async (newUser, oldUser) => {
        console.log(`[Auth Store: Watch] User status changed. newUser exists: ${!!newUser}`);
        
        // 1. Update core login state
        this.isLoggedIn = !!newUser;
        this.authToken = newUser ? await newUser.getIdToken() : null;
        
        // 2. Handle profile data sync
        if (newUser) {
          console.log(`[Auth Store: Watch] User logged in as: ${newUser.email}. Token acquired.`);
          try {
            // Fetch the custom profile data
            await this.fetchUserProfile(newUser.uid); 
            
            // Optional: Update Firebase profile
            if (this.profile?.name && newUser.displayName !== this.profile.name) {
                console.log(`[Auth Store: Watch] Updating Firebase display name to: ${this.profile.name}`);
                await updateProfile(newUser, { displayName: this.profile.name });
            }
          } catch (e: any) {
            console.error('[Auth Store: Watch] Failed to fetch user profile:', e);
            this.error = 'Could not load user profile data.';
          }
        } else {
          // User logged out
          console.log('[Auth Store: Watch] User logged out. Clearing profile.');
          this.profile = null;
        }

        // 3. Mark initialization as complete
        this.isAuthInitialized = true;
        console.log('[Auth Store: Watch] Auth initialization complete.');
      }, { immediate: true }); // Run immediately on setup
    },


    /**
     * Handles user login via Firebase Email/Password.
     */
    async login(email: string, password: string) {
      console.log(`[Auth Store] Attempting login for email: ${email}`);
      this.loading = true;
      this.error = null;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log(`[Auth Store] Firebase login successful! Watcher will now sync state.`);

      } catch (e: any) {
        console.error('[Auth Store] Firebase login failed:', e);
        this.error = e.message || 'An unknown error occurred during login.';
      } finally {
        this.loading = false;
        console.log('[Auth Store] Login process finished.');
      }
    },

    /**
     * Clears the user session via Firebase.
     */
    async logout() {
      console.log('[Auth Store] Attempting logout...');
      this.loading = true;
      this.error = null;

      try {
        await signOut(auth);
        console.log('[Auth Store] Firebase sign out successful! Watcher will now sync state.');
        
        router.push('/login'); 
        console.log('[Auth Store] Redirected to /login.');

      } catch (e: any) {
        console.error('[Auth Store] Firebase logout error:', e);
        this.error = 'Failed to log out.';
      } finally {
        this.loading = false;
        console.log('[Auth Store] Logout process finished.');
      }
    },
    
    /**
     * Checks if a user is authorized for a specific role (useful for middleware/guards).
     */
    hasRole(requiredType: UserProfile['userType']): boolean {
      const userHasRole = this.profile?.userType === requiredType;
      console.log(`[Auth Store] Checking role '${requiredType}'. Result: ${userHasRole}`);
      return userHasRole;
    }
  },
});