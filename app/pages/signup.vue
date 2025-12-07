<template>
  <div class="auth-container">
    <h1>Create an Account</h1>
    
    <form @submit.prevent="handleSignUp">
      <div class="form-group">
        <label for="name">Full Name:</label>
        <input type="text" id="name" v-model="name" required />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      
      <div class="form-group">
        <label for="age">Age:</label>
        <input type="number" id="age" v-model="age" required min="13" />
      </div>

      <div class="form-group">
        <label for="userType">Account Type:</label>
        <select id="userType" v-model="userType" required>
          <option value="Resident">Resident</option>
          <option value="Student">Student</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required minlength="6" />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required />
      </div>
      
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Creating account...' : 'Sign Up' }}
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

<script setup lang="ts">
import { ref } from 'vue'
import { 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

const auth = useFirebaseAuth()!
const db = useFirestore()
const router = useRouter()

const name = ref('')
const email = ref('')
const age = ref('')
const password = ref('')
const confirmPassword = ref('')
const userType = ref<'Resident' | 'Student'>('Resident')
const isLoading = ref(false)
const error = ref<string | null>(null)

async function handleSignUp() {
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match."
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // 1. Create User in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // 2. Update Firebase Auth profile with display name
    await updateProfile(user, {
      displayName: name.value
    })

    // 3. Store user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name.value,
      email: email.value,
      userType: userType.value,
      neighborhoodId: null,
      impactPoints: 0,
      age: parseInt(age.value),
      createdAt: new Date(),
      uid: user.uid
    })

    console.log('[Signup] User created successfully:', user.uid)
    
    // 4. Redirect to home
    router.push('/')
    
  } catch (err: any) {
    console.error('[Signup] Error:', err)
    error.value = err.message || 'Failed to create account'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-footer {
  margin-top: 20px;
  text-align: center;
}

.link-button {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 10px 0;
  transition: color 0.2s;
}

.link-button:hover {
  color: var(--color-accent);
  text-decoration: underline;
}
</style>
