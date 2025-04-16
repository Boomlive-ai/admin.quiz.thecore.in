import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Create the app instance
const app = createApp(App)

// Create the Pinia instance
const pinia = createPinia()

// Install plugins - ORDER IS IMPORTANT
// Pinia must be installed BEFORE any component using stores is mounted
app.use(pinia)
app.use(router)

// Mount the app AFTER Pinia is installed
app.mount('#app')