/**
 * Defines the structure for a user's authenticated profile data.
 * This is the data we expect to receive from the Connect COS backend upon login.
 */
export interface UserProfile {
  organizationId: string | null;
  id: string;
  name: string;
  email: string;
  interests: string[] | null;
  userType: 'Resident' | 'OrgAdmin' | 'Student'; // Key for authorization and permissions
  neighborhoodId: number | null; // For hyper-local filtering, null if not set
  impactPoints: number; // For gamification/impact tracking
}

/**
 * Defines the entire state structure for the Auth Pinia Store.
 * This keeps the state definition clean and organized.
 */
export interface AuthState {
  isLoggedIn: boolean;
  authToken: string | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthInitialized: boolean;
}