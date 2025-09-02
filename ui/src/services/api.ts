import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor for logging and error handling
apiClient.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status)
    }
    return response
  },
  (error) => {
    // Log errors
    console.error('API Error:', error.response?.data || error.message)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      console.log('Unauthorized access - redirecting to login')
      // Don't redirect here as it might cause loops, let the router handle it
    }
    
    if (error.response?.status === 403) {
      console.log('Forbidden access')
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status)
    }
    
    // Return a more user-friendly error
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred'
    
    return Promise.reject(new Error(errorMessage))
  }
)

export default apiClient