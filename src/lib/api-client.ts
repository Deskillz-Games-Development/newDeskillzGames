import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.deskillz.games'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token storage keys
const ACCESS_TOKEN_KEY = 'deskillz_access_token'
const REFRESH_TOKEN_KEY = 'deskillz_refresh_token'

// Token management
export const tokenManager = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
  isAuthenticated: () => !!localStorage.getItem(ACCESS_TOKEN_KEY),
}

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = tokenManager.getRefreshToken()
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          })
          
          const { accessToken, refreshToken: newRefreshToken } = response.data
          tokenManager.setTokens(accessToken, newRefreshToken)
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        tokenManager.clearTokens()
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const errorMessage = getErrorMessage(error)
    return Promise.reject(new Error(errorMessage))
  }
)

// Error message extraction
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as { message?: string; error?: string }
    return data.message || data.error || 'An error occurred'
  }
  if (error.message) {
    return error.message
  }
  return 'Network error. Please check your connection.'
}

// Generic API response type
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Paginated response type
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default apiClient