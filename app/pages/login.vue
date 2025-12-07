<template>
  <div class="login-container">
    <h1>Login</h1>
    <p v-if="currentUser">
      Logged in as: <strong>{{ currentUser.email }}</strong> 
      <button @click="handleSignOut">Logout</button>
    </p>

    <form @submit.prevent="handleSignIn" v-else>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Logging in...' : 'Sign In' }}
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  <div class="auth-footer">
      <button @click="router.push('/signup')" class="link-button">
        Don't have an account? Signup
      </button>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

// useFirebaseAuth is provided by nuxt-vuefire for easy access to the auth instance
const auth = useFirebaseAuth()
// useCurrentUser is a reactive composable that holds the current user state
const currentUser = useCurrentUser() 

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref(null)
const router = useRouter()

/**
 * Handles the login process using Firebase Email/Password authentication.
 */
async function handleSignIn() {
  isLoading.value = true
  error.value = null

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    
    // Success: Redirect the user to a protected page (e.g., home or dashboard)
    router.push('/')
  } catch (err) {
    // Failure: Display the error message
    console.error(err)
    error.value = err.message || 'An unknown error occurred during login.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Handles the sign-out process.
 */
async function handleSignOut() {
  try {
    await signOut(auth)
    router.push('/login') // Redirect back to login after signing out
  } catch (err) {
    console.error('Logout error:', err)
  }
}

// Optional: Basic styling (can be moved to a CSS file)
useHead(() => ({
  style: [
    {
      children: `
        .login-container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="email"], input[type="password"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px; }
        button:disabled { background-color: #a0c9f1; cursor: not-allowed; }
        .error-message { color: red; margin-top: 15px; }
      `
    }
  ]
}))
</script>