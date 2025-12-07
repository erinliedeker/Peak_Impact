<template>
  <div class="auth-container">
    <h1>Create an Account</h1>
    
    <form @submit.prevent="handleSignUp">
      
      <div class="account-type-selector">
        <label>
          <input type="radio" value="individual" v-model="accountType">
          <span>Individual</span>
        </label>
        <label>
          <input type="radio" value="organization" v-model="accountType">
          <span>Organization</span>
        </label>
      </div>

      <div v-if="accountType === 'organization'" class="org-section">
        <div class="form-group">
          <label for="ein">Organization EIN:</label>
          <div class="ein-input-group">
            <input 
              type="text" 
              id="ein" 
              v-model="ein" 
              placeholder="12-3456789"
              @keyup.enter="lookupOrgByEin"
            />
            <button 
              type="button" 
              class="verify-btn" 
              @click="lookupOrgByEin" 
              :disabled="isLookingUp || !ein"
            >
              {{ isLookingUp ? 'Searching...' : 'Auto-fill' }}
            </button>
          </div>
          <small v-if="lookupMessage" :class="lookupStatus">{{ lookupMessage }}</small>
        </div>

        <div class="form-group">
          <label for="orgName">Organization Name:</label>
          <input type="text" id="orgName" v-model="orgName" required placeholder="Auto-filled from EIN" />
        </div>
      </div>

      <div class="form-group">
        <label for="name">{{ accountType === 'organization' ? 'Representative Name:' : 'Full Name:' }}</label>
        <input type="text" id="name" v-model="name" required />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      
      <div class="form-group">
        <label for="age">Age:</label>
        <input type="number" id="age" v-model="age" required min="18" />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required minlength="6" />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required />
      </div>

      <div class="form-group interest-section">
        <label>
          {{ accountType === 'organization' ? 'Organization Causes/Interests:' : 'Your Interests:' }}
          <span class="sub-label">
            {{ accountType === 'organization' ? '(Helps volunteers find you)' : '(Customizes your feed)' }}
          </span>
        </label>
        
        <div class="interests-container">
          <button 
            type="button"
            v-for="interest in globalCategories" 
            :key="interest"
            class="interest-chip"
            :class="{ 'selected': selectedInterests.includes(interest) }"
            @click="toggleInterest(interest)"
          >
            {{ interest }}
          </button>
        </div>
        <small v-if="selectedInterests.length === 0" class="hint-text">Please select at least one interest.</small>
      </div>
      
      
      <button type="submit" :disabled="isLoading" class="submit-btn">
        {{ isLoading ? 'Creating account...' : (accountType === 'organization' ? 'Register Organization' : 'Sign Up') }}
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>
    </form>

    <div class="oauth-divider">
      <span>or</span>
    </div>

    <div class="oauth-buttons">
      <button type="button" class="google-btn" @click="handleGoogleSignIn" :disabled="isLoading">
        <span class="google-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="20" height="20" role="img" focusable="false">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6 1.54 7.38 2.84l5.4-5.26C33.64 3.34 29.28 1.5 24 1.5 14.66 1.5 6.64 7.72 3.64 16.02l6.92 5.37C12 15.18 17.41 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.14-2.76-.42-3.96H24v7.19h12.7c-.26 1.8-1.7 4.5-4.9 6.3l7.54 5.82c4.4-4.06 7.16-10.04 7.16-15.35z"/>
            <path fill="#FBBC05" d="M10.56 28.64A14.5 14.5 0 0 1 9.5 24c0-1.6.28-3.14.76-4.64L3.34 13.9C2.12 16.7 1.5 19.78 1.5 23s.62 6.3 1.84 9.1l7.22-5.46z"/>
            <path fill="#34A853" d="M24 46.5c6.48 0 11.92-2.12 15.9-5.77l-7.54-5.82c-2.04 1.36-4.8 2.3-8.36 2.3-6.6 0-12.03-4.44-14.04-10.57l-6.92 5.37C6.64 40.28 14.66 46.5 24 46.5z"/>
            <path fill="none" d="M1.5 1.5h45v45h-45z"/>
          </svg>
        </span>
        <span>Continue with Google</span>
      </button>
    </div>

    <div class="auth-footer">
      <button @click="router.push('/login')" class="link-button">
        Already have an account? Log In
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore' 
import { globalCategories } from '~~/types/models'

definePageMeta({
  layout: false 
})

const auth = useFirebaseAuth()
const db = useFirestore()
const router = useRouter()

// Form State
const accountType = ref('individual') 
const name = ref('') 
const email = ref('')
const age = ref('')
const password = ref('')
const confirmPassword = ref('')

// --- 🌟 ADDED: Interest Logic 🌟 ---
const selectedInterests = ref([])

function toggleInterest(interest) {
  if (selectedInterests.value.includes(interest)) {
    selectedInterests.value = selectedInterests.value.filter(i => i !== interest)
  } else {
    selectedInterests.value.push(interest)
  }
}
// -----------------------------------

// Org Specific State
const ein = ref('')
const orgName = ref('')
const isLookingUp = ref(false)
const lookupMessage = ref('')
const lookupStatus = ref('') 

const isLoading = ref(false)
const error = ref(null)

// --- Helper: Lookup Org via ProPublica Proxy ---
async function lookupOrgByEin() {
  if (!ein.value) return
  isLookingUp.value = true
  lookupMessage.value = ''
  
  try {
    const { data } = await useFetch('/api/propublica/organizations', {
      query: { q: ein.value }
    })
    
    const response = data.value
    
    if (response && response.organizations && response.organizations.length > 0) {
      const org = response.organizations[0]
      orgName.value = org.name 
      lookupMessage.value = 'Organization found!'
      lookupStatus.value = 'success'
    } else {
      lookupMessage.value = 'No organization found with that EIN.'
      lookupStatus.value = 'error'
    }
  } catch (e) {
    console.error(e)
    lookupMessage.value = 'Failed to lookup EIN.'
    lookupStatus.value = 'error'
  } finally {
    isLookingUp.value = false
  }
}

/**
 * Creates the user profile and (if applicable) the organization document in Firestore.
 * @param {object} user - The Firebase Auth User object.
 * @param {string} userType - 'Volunteer' or 'OrgAdmin'.
 * @param {boolean} isOAuth - True if signing up via Google/OAuth.
 */
async function createFirestoreProfile(user, userType, isOAuth = false) {
    // 1. Determine base userData structure
    const userData = {
        id: user.uid,
        name: user.displayName || name.value,
        email: user.email || email.value,
        age: isOAuth ? null : parseInt(age.value), // Age might not be available for OAuth signups
        userType: userType, 
        createdAt: new Date(),
        // 2. Save Interests: Interests are shared regardless of signup method
        interests: accountType.value === 'individual' ? selectedInterests.value : []
    }

    // 3. If Organization: Create the Org Document
    if (accountType.value === 'organization') {
        const orgRef = await addDoc(collection(db, "organizations"), {
            name: orgName.value,
            ein: ein.value,
            admins: [user.uid],
            type: 'NonProfit',
            description: `Registered by ${userData.name}`,
            contactEmail: userData.email,
            socialLinks: { instagram: null, facebook: null },
            interests: selectedInterests.value 
        })
        
        userData.organizationId = orgRef.id
    }
    
    // 4. Create/Update User Profile in Firestore
    await setDoc(doc(db, "users", user.uid), userData, { merge: true }) // Use merge for safety

    // 5. Redirect
    router.push('/feed')
}

// --- UPDATED: handleSignUp (Email/Password) ---
async function handleSignUp() {
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match."
    return
  }
  
  if (selectedInterests.value.length === 0) {
    error.value = "Please select at least one interest."
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // 1. Create User in Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // 2. Set Display Name (Must happen before calling profile function)
    await updateProfile(user, { displayName: name.value })
    
    // 3. Determine User Roles & Data
    const userType = accountType.value === 'organization' ? 'OrgAdmin' : 'Volunteer'
    
    // 4. Call the centralized persistence function
    await createFirestoreProfile(user, userType, false)
    
  } catch (err) {
    console.error(err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

// --- UPDATED: handleGoogleSignIn (OAuth) ---
async function handleGoogleSignIn() {
  // NOTE: Interests, accountType, and organization details must be set in the form
  // BEFORE clicking the Google button for this to work correctly for organizations.
  
  isLoading.value = true
  error.value = null

  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    
    // Determine the user type based on the currently selected radio button
    const userType = accountType.value === 'organization' ? 'OrgAdmin' : 'Volunteer'

    const userRef = doc(db, 'users', user.uid)
    const snapshot = await getDoc(userRef)

    // Check if user is NEW to the system
    if (!snapshot.exists()) {
      await setDoc(userRef, {
        name: user.displayName || 'New User',
        email: user.email || '',
        age: null,
        userType: 'Volunteer',
        createdAt: new Date()
      })
    }

    if (user.displayName) {
      await updateProfile(user, { displayName: user.displayName })
    }

    router.push('/feed')
  } catch (err) {
    console.error(err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 450px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background-color: white;
}

.account-type-selector {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.account-type-selector label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #4a5568;
}

.account-type-selector input[type="radio"] {
  accent-color: var(--color-primary, #3182ce);
  transform: scale(1.2);
}

.ein-input-group {
  display: flex;
  gap: 10px;
}

.ein-input-group input {
  flex: 1;
}

.verify-btn {
  padding: 0 15px;
  background-color: #718096;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
}

.verify-btn:hover { background-color: #4a5568; }
.verify-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.org-section {
  background-color: #f7fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.success { color: #38a169; font-size: 0.85em; }
.error { color: #e53e3e; font-size: 0.85em; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
.form-group input { 
  width: 100%; 
  padding: 10px; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  box-sizing: border-box;
}

/* 🌟 NEW STYLES FOR INTEREST CHIPS 🌟 */
.interest-section {
  margin-top: 15px;
  margin-bottom: 20px;
}
.sub-label {
  font-size: 0.85em;
  color: #718096;
  font-weight: normal;
  margin-left: 5px;
}
.interests-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  max-height: 200px; /* Optional: Scroll if list gets huge */
  overflow-y: auto;
}
.interest-chip {
  background-color: #fff;
  border: 1px solid #cbd5e0;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.85rem;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
}
.interest-chip:hover {
  border-color: #3182ce;
  background-color: #ebf8ff;
}
.interest-chip.selected {
  background-color: #3182ce; /* Primary Color */
  color: white;
  border-color: #3182ce;
}
.hint-text {
  color: #e53e3e;
  font-size: 0.8em;
  margin-top: 5px;
  display: block;
}
/* ------------------------------------- */

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--color-primary, #3182ce);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;
}

.submit-btn:hover { background-color: #2c5282; }
.submit-btn:disabled { background-color: #a0aec0; }
.error-message { color: red; margin-top: 10px; text-align: center; }

.auth-footer { margin-top: 20px; text-align: center; }
.link-button {
  background: none; border: none; color: #3182ce;
  font-weight: 600; cursor: pointer; padding: 10px 0;
}
.link-button:hover { text-decoration: underline; }

.oauth-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4a5568;
  font-size: 0.9rem;
  margin: 20px 0;
}

.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e2e8f0;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  color: #2d3748;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.google-icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
}

.google-btn:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.google-btn:active { transform: translateY(1px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
</style>