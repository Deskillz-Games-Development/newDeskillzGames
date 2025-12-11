import apiClient, { ApiResponse, PaginatedResponse } from '../api-client'

// Types
export interface UserProfile {
  id: string
  username: string
  email: string
  role: 'player' | 'developer' | 'admin'
  avatarUrl?: string
  bio?: string
  walletAddress?: string
  createdAt: string
  stats: UserStats
  achievements?: Achievement[]
  recentGames?: RecentGame[]
}

export interface UserStats {
  totalEarnings: number
  totalWins: number
  totalLosses: number
  totalTournaments: number
  winRate: number
  currentStreak: number
  bestStreak: number
  rank?: number
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
}

export interface Achievement {
  id: string
  name: string
  description: string
  iconUrl: string
  unlockedAt: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface RecentGame {
  gameId: string
  gameName: string
  gameIcon: string
  lastPlayed: string
  totalMatches: number
  wins: number
}

export interface Transaction {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'entry_fee' | 'prize' | 'refund'
  amount: number
  currency: string
  txHash?: string
  status: 'pending' | 'confirmed' | 'failed'
  description?: string
  createdAt: string
  metadata?: {
    tournamentId?: string
    tournamentName?: string
    gameId?: string
    gameName?: string
  }
}

export interface WalletBalance {
  currency: string
  symbol: string
  amount: number
  usdValue: number
  color: string
}

export interface UserWallet {
  address: string
  chainId: number
  chainName: string
  balances: WalletBalance[]
  totalBalanceUSD: number
}

export interface LeaderboardEntry {
  rank: number
  previousRank: number
  userId: string
  username: string
  avatarUrl?: string
  earnings: number
  wins: number
  winRate: number
  tournaments: number
  tier?: string
}

export interface UpdateProfileRequest {
  username?: string
  email?: string
  bio?: string
  avatarUrl?: string
}

// Users API
export const usersApi = {
  // Get user profile
  getProfile: async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(`/api/v1/users/${userId}`)
    return response.data.data
  },

  // Get current user profile
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/api/v1/users/me')
    return response.data.data
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.patch<ApiResponse<UserProfile>>('/api/v1/users/me', data)
    return response.data.data
  },

  // Get user stats
  getUserStats: async (userId: string): Promise<UserStats> => {
    const response = await apiClient.get<ApiResponse<UserStats>>(`/api/v1/users/${userId}/stats`)
    return response.data.data
  },

  // Get user transactions
  getTransactions: async (
    page = 1,
    limit = 20,
    type?: string
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(
      '/api/v1/users/me/transactions',
      { params: { page, limit, type } }
    )
    return response.data
  },

  // Get user wallet info
  getWallet: async (): Promise<UserWallet> => {
    const response = await apiClient.get<ApiResponse<UserWallet>>('/api/v1/users/me/wallet')
    return response.data.data
  },

  // Get user achievements
  getAchievements: async (userId: string): Promise<Achievement[]> => {
    const response = await apiClient.get<ApiResponse<Achievement[]>>(
      `/api/v1/users/${userId}/achievements`
    )
    return response.data.data
  },

  // Link wallet address
  linkWallet: async (walletAddress: string, signature: string): Promise<void> => {
    await apiClient.post('/api/v1/users/me/wallet', { walletAddress, signature })
  },

  // Get global leaderboard
  getGlobalLeaderboard: async (
    period: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'weekly',
    limit = 100
  ): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
      '/api/v1/leaderboard/global',
      { params: { period, limit } }
    )
    return response.data.data
  },

  // Get game-specific leaderboard
  getGameLeaderboard: async (
    gameId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'weekly',
    limit = 100
  ): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
      `/api/v1/leaderboard/game/${gameId}`,
      { params: { period, limit } }
    )
    return response.data.data
  },

  // Get user's rank
  getUserRank: async (userId: string, gameId?: string): Promise<{ rank: number; total: number }> => {
    const response = await apiClient.get<ApiResponse<{ rank: number; total: number }>>(
      `/api/v1/users/${userId}/rank`,
      { params: { gameId } }
    )
    return response.data.data
  },

  // Search users
  searchUsers: async (query: string, limit = 10): Promise<UserProfile[]> => {
    const response = await apiClient.get<ApiResponse<UserProfile[]>>('/api/v1/users/search', {
      params: { q: query, limit },
    })
    return response.data.data
  },
}

export default usersApi