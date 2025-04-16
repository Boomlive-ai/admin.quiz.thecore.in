<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth.js'
import AuthPopup from './components/AuthPopup.vue'

const route = useRoute()
const showAuthPopup = ref(false)

// Init auth store and reactive state
const authStore = useAuthStore()
const { isAuthenticated, currentUser } = storeToRefs(authStore)

// Check authentication on mount
onMounted(async () => {
  console.log("App mounted — checking auth")
  await authStore.checkAuth()

  // Show login popup if redirected with ?requiresAuth
  if (!isAuthenticated.value && route.query.requiresAuth) {
    showAuthPopup.value = true
  }
})

// Logout handler
const logout = () => {
  authStore.logout()
}

// Watch query param changes for requiresAuth
watch(
  () => route.query,
  (query) => {
    if (query.requiresAuth && !isAuthenticated.value) {
      showAuthPopup.value = true
    }
  }
)
</script>


<template>
  <header>
    <RouterLink to="/" class="nav-header">
      <img alt="Vue logo" class="logo" src="@/assets/logo.png" />
      <h1>The Core Moguls</h1>
    </RouterLink>


    <nav class="nav-links">
   
      <template v-if="isAuthenticated">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <span class="user-email" v-if="currentUser">
          {{ currentUser.email }}
        </span>
        <RouterLink to="/about">About</RouterLink>

        <button class="auth-btn logout" @click="logout">Logout</button>
      </template>

      <button v-else class="auth-btn login" @click="showAuthPopup = true">Login</button>
    </nav>

  </header>

  <main>
    <RouterView />
  </main>

  <AuthPopup :show="showAuthPopup" @close="showAuthPopup = false" />
</template>

<style>
/* Your existing styles here */
/* Add styles for auth buttons if needed */
.auth-btn {
  background-color: transparent;
  border: 1px solid #ddd;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.auth-btn.login {
  background-color: #007BFF;
  color: white;
}

.auth-btn.logout {
  background-color: transparent;
  color: #333;
}

.user-email {
  margin-right: 1rem;
  font-size: 0.9rem;
  color: #666;
}

/* Overall header styling with background, border and padding */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.nav-header {
  text-decoration: none;
}

header {
  background-color: var(--header-bg, #f5f5f5);
  border-bottom: 1px solid #ddd;
  padding: 1rem;

  /* Default flex layout in column to make two rows */
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Branding/Navigation header (first row) */
.nav-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

/* Logo styling */
.logo {
  width: 60px;
  height: auto;
  margin-right: 1rem;
}

/* Optional heading, can be styled to suit your branding */
.nav-header h1 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--color-text, #333);
}

/* Navigation links (second row) arranged horizontally */
.nav-links {
  display: flex;
  gap: 1.5rem;
}

/* Base style for links */
.nav-links a {
  text-decoration: none;
  color: var(--color-text, #333);
  font-size: 1rem;
  padding: 0.5rem 1rem;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 4px;
}

/* Hover effect for links */
.nav-links a:hover {
  background-color: var(--nav-hover-bg, #e0e0e0);
}

/* Active route indicator styling */
.router-link-active {
  font-weight: bold;
  color: var(--nav-active-color, #007BFF);
}

/* Main content styling for spacing */
main {
  padding: 1rem;
}

/* Responsive tweaks: on larger screens show a horizontal header layout */
@media (min-width: 768px) {
  header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  /* Remove bottom margin from branding row for horizontal layout */
  .nav-header {
    margin-bottom: 0;
  }

  /* Align navigation links to the right */
  .nav-links {
    justify-content: flex-end;
  }
}
</style>