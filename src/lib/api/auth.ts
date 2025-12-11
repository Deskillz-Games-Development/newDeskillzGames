import apiClient, { tokenManager, ApiResponse } from '../api-client'

// Types
export interface User {
  id: string
  username: string
  email: string
  role: 'player' | 'developer' | 'admin'
  avatarUrl?: string
  walletAddress?: string
  createdAt: string
  stats?: {
    totalEarnings: number
    totalWins: number
    totalTournaments: number
    winRate: number
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  walletAddress: string
  signature: string
  message: string
}

export interface RegisterRequest {
  username: string
  email: string
  walletAddress: string
  signature: string
  message: string
}

export interface NonceResponse {
  nonce: string
  message: string
}

// Auth API
export const authApi = {
  // Get nonce for wallet signature
  getNonce: async (walletAddress: string): Promise<NonceResponse> => {
    const response = await apiClient.get<ApiResponse<NonceResponse>>(
      `/api/v1/auth/nonce/${walletAddress}`
    )
    return response.data.data
  },

  // Login with wallet signature
  login: async (data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/api/v1/auth/login',
      data
    )
    const { user, tokens } = response.data.data
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken)
    return { user, tokens }
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/api/v1/auth/register',
      data
    )
    const { user, tokens } = response.data.data
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken)
    return { user, tokens }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/auth/me')
    return response.data.data
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/v1/auth/logout')
    } finally {
      tokenManager.clearTokens()
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      '/api/v1/auth/refresh',
      { refreshToken }
    )
    const tokens = response.data.data
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken)
    return tokens
  },

  // Check if authenticated
  isAuthenticated: () => tokenManager.isAuthenticated(),
}

export default authApi