<!-- src/components/AuthPopup.vue -->
<template>
    <Teleport to="body">
      <div v-if="show" class="auth-overlay">
        <div class="auth-popup">
          <div class="auth-header">
            <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
            <button class="close-btn" @click="$emit('close')">×</button>
          </div>
  
          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>
  
          <form @submit.prevent="handleSubmit" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="email"
                required
                placeholder="Enter your email"
              />
            </div>
  
            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                v-model="password"
                required
                placeholder="Enter your password"
                min="4"
              />
            </div>
  
            <div v-if="!isLogin" class="form-group">
              <label for="secretToken">Secret Token</label>
              <input
                type="text"
                id="secretToken"
                v-model="secretToken"
                required
                placeholder="Enter admin secret token"
              />
            </div>
  
            <div class="form-actions">
              <button 
                type="submit" 
                class="submit-btn" 
                :disabled="authStore.loading"
              >
                {{ isLogin ? 'Login' : 'Register' }}
              </button>
              
              <button 
                type="button" 
                class="toggle-btn" 
                @click="isLogin = !isLogin" 
                :disabled="authStore.loading"
              >
                {{ isLogin ? 'Need an account?' : 'Already have an account?' }}
              </button>
            </div>
          </form>
          
          <div v-if="authStore.loading" class="loading-indicator">
            Loading...
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '../stores/auth'
  
  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['close', 'authenticated'])
  
  const authStore = useAuthStore()
  const isLogin = ref(true)
  const email = ref('')
  const password = ref('')
  const secretToken = ref('')
  
  const handleSubmit = async () => {
    let success = false
    
    if (isLogin.value) {
      success = await authStore.login(email.value, password.value)
    } else {
      success = await authStore.register(email.value, password.value, secretToken.value)
      if (success) {
        // If registration successful, switch to login
        isLogin.value = true
        // Clear the form
        email.value = ''
        password.value = ''
        secretToken.value = ''
        return
      }
    }
  
    if (success && isLogin.value) {
      // Clear form and close popup on successful login
      email.value = ''
      password.value = ''
      emit('authenticated')
      emit('close')
    }
  }
  </script>
  
  <style scoped>
  .auth-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .auth-popup {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .auth-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }
  
  .close-btn:hover {
    color: #333;
  }
  
  .error-message {
    background-color: #ffebee;
    color: #c62828;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
  }
  
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .form-group label {
    font-weight: 500;
    color: #333;
  }
  
  .form-group input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
  }
  
  .submit-btn {
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  .submit-btn:hover {
    background-color: #0069d9;
  }
  
  .submit-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .toggle-btn {
    background: none;
    border: none;
    color: #007BFF;
    cursor: pointer;
    padding: 5px;
  }
  
  .toggle-btn:hover {
    text-decoration: underline;
  }
  
  .toggle-btn:disabled {
    color: #999;
    cursor: not-allowed;
  }
  
  .loading-indicator {
    text-align: center;
    margin-top: 15px;
    color: #666;
  }
  </style>