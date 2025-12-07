<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      
      <div class="auth-header">
        <div class="logo-container">
          <img src="~/assets/images/logo.png" alt="Logo" class="logo-img" />
        </div>
        <h1>Welcome Back</h1>
        <p class="subtitle">Log in to Peak Impact to continue</p>
      </div>

      <form @submit.prevent="handleSignIn" class="auth-form">
        
        <div class="input-group">
          <label for="email">Email Address</label>
          <div class="input-wrapper">
            <Icon name="heroicons:envelope" class="field-icon" />
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="name@example.com"
              required 
            />
          </div>
        </div>
        
        <div class="input-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <Icon name="heroicons:lock-closed" class="field-icon" />
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="••••••••"
              required 
            />
          </div>
        </div>
        
        <div v-if="error" class="error-alert">
          <Icon name="heroicons:exclamation-circle-solid" />
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? 'Logging in...' : 'Sign In' }}
        </button>
      </form>
      
      <div class="auth-footer">
        <p>Don't have an account?</p>
        <button @click="router.push('/signup')" class="link-btn">
          Create an account
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'

definePageMeta({
  layout: false 
})

const auth = useFirebaseAuth()
const currentUser = useCurrentUser() 
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref(null)

// --- NEW: Redirect if already logged in ---
// If the user visits this page and is already authenticated, send them Home.
watch(currentUser, (user, prevUser) => {
  if (user && !prevUser) {
    router.push('/feed')
  }
}, { immediate: true }) // immediate: true checks it as soon as the page loads
// ------------------------------------------

async function handleSignIn() {
  isLoading.value = true
  error.value = null

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/feed')
  } catch (err) {
    console.error(err)
    if (err.code === 'auth/invalid-credential') {
      error.value = 'Invalid email or password.'
    } else {
      error.value = err.message || 'An unknown error occurred.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>


.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  border: 1px solid white;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-img {
  height: 50px;
  width: auto;
}

h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-main);
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: var(--color-text-sub);
  font-size: 0.95rem;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  font-size: 1.2rem;
  pointer-events: none;
}

input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--color-text-main);
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #f9fafb;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 0.5rem;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-sub);
}

.link-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0 4px;
  text-decoration: none;
}

.link-btn:hover {
  text-decoration: underline;
}

.error-alert {
  background: #fef2f2;
  color: #991b1b;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #fecaca;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>