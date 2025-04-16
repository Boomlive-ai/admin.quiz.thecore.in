    // src/stores/auth.js
    import { defineStore } from 'pinia'
    import { ref } from 'vue'
    import axios from 'axios'

    // Define the base URL for your API calls
    const API_BASE_URL = 'http://quiz.thecore.in';

    export const useAuthStore = defineStore('auth', () => {
    const currentUser = ref(null)
    const isAuthenticated = ref(false)
    const loading = ref(false)
    const error = ref(null)
    const checkedAuth = ref(false)

    // // Check if user is authenticated on app load
    // const checkAuth = async () => {
    //     console.log(" Checking authentication...");
        
    //     loading.value = true
    //     error.value = null
        
    //     try {
    //     // Use the correct endpoint for auth checking
    //     const response = await axios.get(`${API_BASE_URL}/backend-dev/admin/check-auth`, {
    //         withCredentials: true // Important for sending cookies cross-domain
    //     })
    //     console.log(response);
        
    //     if (response.data.status === 'success') {
    //         isAuthenticated.value = true
    //         console.log({
    //             "status": "success",
    //             "message": "Authenticated successfully."
    //         })
    //         // You might want to fetch user details here if needed
    //     } else {
    //         console.log({
    //             "status": "failure",
    //             "message": "Not Authenticated ."
    //         });
            
    //         isAuthenticated.value = false
    //         currentUser.value = null
    //     }
    //     } catch (err) {
    //     console.error('Auth check failed:', err)
    //     isAuthenticated.value = false
    //     currentUser.value = null
    //     error.value = 'Authentication check failed'
    //     } finally {
    //     loading.value = false
    //     checkedAuth.value = true // Set this to true after checking

    //     }
    // }
    const checkAuth = async () => {
        console.log("Checking authentication...");
        
        loading.value = true
        error.value = null
        
        try {
            // Get the token from cookies
            const token = getCookieValue('secret_token');
            console.log(token);
            
            // If no token is found, user is not authenticated
            if (!token) {
                isAuthenticated.value = false
                currentUser.value = null
                console.log({
                    "status": "failure",
                    "message": "No authentication token found."
                });
                return;
            }
            
            // Use the token as a query parameter instead of relying on withCredentials
            const response = await axios.get(`${API_BASE_URL}/backend-dev/admin/check-auth?token=${token}`, {
                // withCredentials no longer needed if we're using query param
                // withCredentials: true
            })
            
            console.log(response);
            
            if (response.data.status === 'success') {
                isAuthenticated.value = true
                console.log({
                    "status": "success",
                    "message": "Authenticated successfully."
                })
                // You might want to fetch user details here if needed
            } else {
                console.log({
                    "status": "failure",
                    "message": "Not Authenticated."
                });
                
                isAuthenticated.value = false
                currentUser.value = null
            }
        } catch (err) {
            console.error('Auth check failed:', err)
            isAuthenticated.value = false
            currentUser.value = null
            error.value = 'Authentication check failed'
        } finally {
            loading.value = false
            checkedAuth.value = true // Set this to true after checking
        }
    }
    
    // Helper function to get cookie value by name
    function getCookieValue(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }
    // Login function
    const login = async (email, password) => {
        loading.value = true;
        error.value = null;
    
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
    
            // Make the login request
            const response = await axios.post(`${API_BASE_URL}/backend-dev/admin/login`, formData, {
                withCredentials: true // Important for receiving cookies
            });
    
            if (response.data.status === 'success') {
                // Save secret token in a cookie
                document.cookie = `secret_token=${response.data.admin.secret_token}; Path=/; Secure; SameSite=Lax`;
    
                // Update state
                currentUser.value = response.data.admin;
                isAuthenticated.value = true;
    
                return true;
            } else {
                error.value = response.data.message || 'Login failed';
                return false;
            }
        } catch (err) {
            console.error('Login error:', err);
            error.value = err.response?.data?.message || 'Login failed';
            return false;
        } finally {
            loading.value = false;
        }
    };
    
    
    // Logout function
    const logout = async () => {
        try {
            // Delete the cookie with multiple approaches to ensure it works
            
            // Standard approach (same path as original cookie)
            document.cookie = 'secret_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.thecore.in;';
            
            // Also try the root path with same domain
            document.cookie = 'secret_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.thecore.in;';
            
            // Try without specifying domain (for same-origin cookies)
            document.cookie = 'secret_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            
            // You might also want to call a server-side logout endpoint to invalidate the token
            // This is highly recommended for security reasons
            try {
                await axios.post(`${API_BASE_URL}/backend-dev/admin/logout`, {}, { 
                    withCredentials: true 
                });
                console.log("Server-side logout successful");
            } catch (error) {
                console.error("Server-side logout failed:", error);
                // Continue with client-side logout anyway
            }
            
            // Reset application state
            currentUser.value = null;
            isAuthenticated.value = false;
            
            console.log("Logout completed");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }
    // Register function (for admin users)
    const register = async (email, password, secretToken) => {
        loading.value = true
        error.value = null
        
        try {
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        formData.append('secret-token', secretToken)
        
        // Use the correct register endpoint
        const response = await axios.post(`${API_BASE_URL}/backend-dev/admin/register`, formData, {
            withCredentials: true
        })
        
        if (response.data.status === 'success') {
            return true
        } else {
            error.value = response.data.message || 'Registration failed'
            return false
        }
        } catch (err) {
        console.error('Registration error:', err)
        error.value = err.response?.data?.message || 'Registration failed'
        return false
        } finally {
        loading.value = false
        }
    }
    
    return {
        currentUser,
        isAuthenticated,
        loading,
        error,
        checkAuth,
        login,
        logout,
        register,
        checkedAuth
    }
    })