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
      
      <button type="submit" :disabled="isLoading" class="submit-btn">
        {{ isLoading ? 'Creating account...' : (accountType === 'organization' ? 'Register Organization' : 'Sign Up') }}
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>
    </form>

    <div class="auth-footer">
      <button @click="router.push('/login')" class="link-button">
        Already have an account? Log In
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, addDoc, collection } from 'firebase/firestore' // Added addDoc/collection

const auth = useFirebaseAuth()
const db = useFirestore()
const router = useRouter()

// Form State
const accountType = ref('individual') // 'individual' | 'organization'
const name = ref('') 
const email = ref('')
const age = ref('')
const password = ref('')
const confirmPassword = ref('')

// Org Specific State
const ein = ref('')
const orgName = ref('')
const isLookingUp = ref(false)
const lookupMessage = ref('')
const lookupStatus = ref('') // 'success' or 'error'

const isLoading = ref(false)
const error = ref(null)

// --- Helper: Lookup Org via ProPublica Proxy ---
async function lookupOrgByEin() {
  if (!ein.value) return
  
  isLookingUp.value = true
  lookupMessage.value = ''
  
  try {
    // We use the search endpoint, treating the EIN as the query "q"
    const { data } = await useFetch('/api/propublica/organizations', {
      query: { q: ein.value }
    })
    
    const response = data.value
    
    if (response && response.organizations && response.organizations.length > 0) {
      // Success: Grab the first result
      const org = response.organizations[0]
      orgName.value = org.name // Auto-fill the name
      
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

async function handleSignUp() {
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match."
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // 1. Create User in Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // 2. Set Display Name
    await updateProfile(user, { displayName: name.value })
    
    // 3. Determine User Roles & Data
    const userType = accountType.value === 'organization' ? 'OrgAdmin' : 'Volunteer'
    
    const userData = {
      name: name.value,
      email: email.value,
      age: parseInt(age.value),
      userType: userType, // Store their role
      createdAt: new Date()
    }

    // 4. If Organization: Create the Org Document first
    if (accountType.value === 'organization') {
      // Create the organization in the 'organizations' collection
      // We assume the current user is the first ADMIN of this org
      const orgRef = await addDoc(collection(db, "organizations"), {
        name: orgName.value,
        ein: ein.value,
        admins: [user.uid], // IMPORTANT: Link user to org
        type: 'NonProfit', // Default, or could be fetched
        description: `Registered by ${name.value}`,
        contactEmail: email.value,
        socialLinks: { instagram: null, facebook: null }
      })
      
      // Optional: Add the orgId to the user's profile for quick access
      userData.organizationId = orgRef.id
    }
    
    // 5. Create User Profile in Firestore
    await setDoc(doc(db, "users", user.uid), userData)
    
    // 6. Redirect
    router.push('/')
    
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
  /* Optional: Add a subtle card look */
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background-color: white;
}

/* Account Type Toggle */
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

/* EIN Input Group */
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

.verify-btn:hover {
  background-color: #4a5568;
}

.verify-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.org-section {
  background-color: #f7fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

/* Status Messages */
.success { color: #38a169; font-size: 0.85em; }
.error { color: #e53e3e; font-size: 0.85em; }

/* Existing Styles */
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
.form-group input { 
  width: 100%; 
  padding: 10px; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  box-sizing: border-box;
}

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
</style>
