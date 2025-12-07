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

<script setup>
import { ref } from 'vue'
import { 
  createUserWithEmailAndPassword, 
  updateProfile // 👈 Import updateProfile
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

const auth = useFirebaseAuth()
const db = useFirestore()
const router = useRouter()

// 👇 NEW: Reactive ref for the user's name
const name = ref('') 
const email = ref('')
const age = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref(null)

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

    // 2. Add Name to the Firebase User Profile
    // This makes the display name available via user.displayName
    await updateProfile(user, {
      displayName: name.value
    })
    
    // 3. Store extra details in Firestore (including name)
    await setDoc(doc(db, "users", user.uid), {
      name: name.value, // 👈 Store name in Firestore document
      email: email.value,
      age: parseInt(age.value),
      createdAt: new Date()
    })
    
    // 4. Redirect
    router.push('/')
    
  } catch (err) {
    console.error(err)
    // Check if the error is a FirebaseError and provide a mapped message
    error.value = err.message
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
  color: var(--color-primary); /* Use your primary color */
  font-weight: 600;
  cursor: pointer;
  padding: 10px 0;
  transition: color 0.2s;
}

.link-button:hover {
  color: var(--color-accent); /* Orange on hover */
  text-decoration: underline;
}
</style>