import { defineStore } from "pinia";
import {
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore"; // Added for future Firestore integration
import type { FirebaseError } from "firebase/app";
import type { UserProfile, AuthState } from "../types/user";

// Define custom error interface for better type safety
interface StoreError {
  code?: string;
  message: string;
}

export const useAuthStore = defineStore("auth", {
  // ----------------------------------------------------------------
  // 💾 State
  // ----------------------------------------------------------------
  state: (): AuthState => ({
    isLoggedIn: false,
    authToken: null,
    profile: null,
    loading: false,
    error: null,
    isAuthInitialized: false,
  }),

  // ----------------------------------------------------------------
  // 🔍 Getters
  // ----------------------------------------------------------------
  getters: {
    isAuthenticated: (state): boolean => state.isLoggedIn,

    isOrgAdmin: (state): boolean => state.profile?.userType === "OrgAdmin",

    userName: (state): string => state.profile?.name || "Guest",

    userEmail: (state): string => state.profile?.email || "",

    currentImpactPoints: (state): number => state.profile?.impactPoints || 0,
  },

  // ----------------------------------------------------------------
  // ⚡ Actions
  // ----------------------------------------------------------------
  actions: {
    /**
     * Initializes the Firebase Auth listener.
     * MUST be called from a Nuxt Plugin (e.g., plugins/auth.ts).
     */
    async initializeAuth() {
      if (process.server) return; // Ensure this only runs on client

      // Disable Firebase auth persistence - use session storage only (clears on browser close)
      // ... inside initializeAuth
      const auth = useFirebaseAuth();
      if (auth) {
        const { setPersistence, browserLocalPersistence } = await import(
          "firebase/auth"
        );
        // Changed from browserSessionPersistence to browserLocalPersistence
        try {
          await setPersistence(auth, browserLocalPersistence);
        } catch (error) {
          console.error("[AuthStore] Failed to set persistence:", error);
        }
      }

      const firebaseUser = useCurrentUser(); // VueFire composable

      watch(
        firebaseUser,
        async (currentUser) => {
          try {
            if (currentUser) {
              // 1. User Logged In
              this.authToken = await currentUser.getIdToken();
              this.isLoggedIn = true;

              // 2. Sync Custom Profile
              await this.syncUserProfile(
                currentUser.uid,
                currentUser.displayName
              );
            } else {
              // 3. User Logged Out
              this.resetState();
            }
          } catch (error) {
            console.error("[AuthStore] Sync Error:", error);
            this.error = "Failed to synchronize user session.";
          } finally {
            this.isAuthInitialized = true;
          }
        },
        { immediate: true }
      );
    },

    /**
     * Internal helper to fetch profile from Firestore and keep local state in sync.
     */
    async syncUserProfile(uid: string, firebaseDisplayName: string | null) {
      try {
        await this.fetchUserProfile(uid);

        // Optional: Bi-directional sync (Update Firebase Auth if Firestore has better data)
        const currentUser = useCurrentUser().value;
        if (
          currentUser &&
          this.profile?.name &&
          firebaseDisplayName !== this.profile.name
        ) {
          await updateProfile(currentUser, { displayName: this.profile.name });
        }
      } catch (error) {
        console.error("[AuthStore] Profile Sync Failed:", error);
        // Decide logic here: Logout user if profile fails? Or allow degraded mode?
        // For strict apps: await this.logout(false);
      }
    },

    /**
     * Fetches user profile from Firestore.
     */
    async fetchUserProfile(uid: string) {
      this.loading = true;
      try {
        const db = getFirestore();
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          this.profile = {
            ...data,
            id: uid, // Add document ID to profile
          } as UserProfile;
          console.log("User logged in: ", this.profile);
        } else {
          throw new Error("User profile document not found.");
        }
      } catch (error) {
        throw error; // Let caller handle or bubble up
      } finally {
        this.loading = false;
      }
    },

    /**
     * Authenticates user with Email and Password.
     */
    async login(email: string, password: string) {
      const auth = useFirebaseAuth(); // Scope: Action-level only
      if (!auth) throw new Error("Auth instance not ready");

      this.loading = true;
      this.error = null;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Note: State update happens in initializeAuth watcher
      } catch (err: any) {
        const firebaseError = err as FirebaseError;
        this.error = this.mapAuthError(firebaseError.code);
        console.error("[AuthStore] Login Error:", firebaseError.code);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Signs the user out and optionally redirects.
     */
    async logout(shouldRedirect = true) {
      const auth = useFirebaseAuth();
      if (!auth) return;

      this.loading = true;

      try {
        await signOut(auth);

        // Explicitly clear ALL storage to ensure complete logout
        sessionStorage.clear();

        // Clear all Firebase-related localStorage entries
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("firebase:") || key.includes("auth")) {
            localStorage.removeItem(key);
          }
        });

        // Reset state immediately
        this.resetState();

        if (shouldRedirect) {
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("[AuthStore] Logout Error:", err);
        this.error = "Failed to logout safely.";
      } finally {
        this.loading = false;
      }
    },

    /**
     * Resets state to guest mode.
     */
    resetState() {
      this.isLoggedIn = false;
      this.authToken = null;
      this.profile = null;
      this.error = null;
    },

    /**
     * Utility to map Firebase error codes to human-readable messages.
     */
    mapAuthError(code: string): string {
      switch (code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          return "Invalid email or password.";
        case "auth/too-many-requests":
          return "Too many attempts. Please try again later.";
        default:
          return "An unexpected error occurred. Please try again.";
      }
    },

    /**
     * Permission check helper.
     */
    hasRole(requiredType: UserProfile["userType"]): boolean {
      return this.profile?.userType === requiredType;
    },
  },
});
