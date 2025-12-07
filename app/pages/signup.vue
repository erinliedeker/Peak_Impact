<template>
  <div class="auth-container">
    <h1>Create an Account</h1>
    
    <form @submit.prevent="handleSignUp">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore' // Import Firestore functions

const auth = useFirebaseAuth()
const db = useFirestore() // Get the Firestore database instance
const router = useRouter()

const email = ref('')
const age = ref('') // Reactive ref for age
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

    // 2. Store extra details in Firestore
    // We create a document inside the 'users' collection with the ID matching the User's UID
    await setDoc(doc(db, "users", user.uid), {
      email: email.value,
      age: parseInt(age.value), // Ensure age is stored as a number
      createdAt: new Date()
    })
    
    // 3. Redirect
    router.push('/')
    
  } catch (err) {
    console.error(err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

// ... styles remain the same
</script>