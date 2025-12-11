import apiClient, { ApiResponse, PaginatedResponse } from '../api-client'

// Types
export interface Tournament {
  id: string
  gameId: string
  name: string
  description?: string
  entryFee: number
  entryCurrency: string
  prizePool: number
  prizeCurrency: string
  maxPlayers: number
  currentPlayers: number
  mode: 'sync' | 'async'
  status: 'upcoming' | 'open' | 'in_progress' | 'completed' | 'cancelled'
  startsAt: string
  endsAt: string
  serviceFeePercent: number
  createdAt: string
  game?: {
    id: string
    name: string
    iconUrl: string
    genre: string
  }
  prizeDistribution?: PrizeDistribution[]
}

export interface PrizeDistribution {
  rank: number
  percentage: number
  amount: number
}

export interface TournamentEntry {
  id: string
  tournamentId: string
  userId: string
  entryTxHash?: string
  status: 'pending' | 'confirmed' | 'playing' | 'completed' | 'refunded'
  joinedAt: string
  finalRank?: number
  prizeWon?: number
  user?: {
    id: string
    username: string
    avatarUrl?: string
  }
}

export interface TournamentScore {
  id: string
  tournamentId: string
  userId: string
  score: number
  verified: boolean
  submittedAt: string
  user?: {
    id: string
    username: string
    avatarUrl?: string
  }
}

export interface TournamentFilters {
  gameId?: string
  status?: string
  mode?: string
  minEntryFee?: number
  maxEntryFee?: number
  search?: string
  sortBy?: 'startsAt' | 'prizePool' | 'entryFee' | 'players'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface JoinTournamentRequest {
  tournamentId: string
  txHash: string
}

export interface SubmitScoreRequest {
  tournamentId: string
  score: number
  metadata?: string // Encrypted game state hash
}

// Tournaments API
export const tournamentsApi = {
  // Get all tournaments (with filters)
  getTournaments: async (filters?: TournamentFilters): Promise<PaginatedResponse<Tournament>> => {
    const response = await apiClient.get<PaginatedResponse<Tournament>>('/api/v1/tournaments', {
      params: filters,
    })
    return response.data
  },

  // Get live/active tournaments
  getLiveTournaments: async (limit = 10): Promise<Tournament[]> => {
    const response = await apiClient.get<ApiResponse<Tournament[]>>('/api/v1/tournaments/live', {
      params: { limit },
    })
    return response.data.data
  },

  // Get upcoming tournaments
  getUpcomingTournaments: async (limit = 10): Promise<Tournament[]> => {
    const response = await apiClient.get<ApiResponse<Tournament[]>>('/api/v1/tournaments/upcoming', {
      params: { limit },
    })
    return response.data.data
  },

  // Get single tournament by ID
  getTournament: async (id: string): Promise<Tournament> => {
    const response = await apiClient.get<ApiResponse<Tournament>>(`/api/v1/tournaments/${id}`)
    return response.data.data
  },

  // Get tournament leaderboard
  getLeaderboard: async (id: string): Promise<TournamentScore[]> => {
    const response = await apiClient.get<ApiResponse<TournamentScore[]>>(
      `/api/v1/tournaments/${id}/leaderboard`
    )
    return response.data.data
  },

  // Get tournament participants
  getParticipants: async (id: string): Promise<TournamentEntry[]> => {
    const response = await apiClient.get<ApiResponse<TournamentEntry[]>>(
      `/api/v1/tournaments/${id}/participants`
    )
    return response.data.data
  },

  // Join tournament
  joinTournament: async (data: JoinTournamentRequest): Promise<TournamentEntry> => {
    const response = await apiClient.post<ApiResponse<TournamentEntry>>(
      `/api/v1/tournaments/${data.tournamentId}/join`,
      { txHash: data.txHash }
    )
    return response.data.data
  },

  // Leave tournament (before it starts)
  leaveTournament: async (id: string): Promise<void> => {
    await apiClient.post(`/api/v1/tournaments/${id}/leave`)
  },

  // Submit score
  submitScore: async (data: SubmitScoreRequest): Promise<TournamentScore> => {
    const response = await apiClient.post<ApiResponse<TournamentScore>>(
      `/api/v1/tournaments/${data.tournamentId}/score`,
      { score: data.score, metadata: data.metadata }
    )
    return response.data.data
  },

  // Get user's tournament history
  getUserTournaments: async (
    userId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<TournamentEntry>> => {
    const response = await apiClient.get<PaginatedResponse<TournamentEntry>>(
      `/api/v1/users/${userId}/tournaments`,
      { params: { page, limit } }
    )
    return response.data
  },

  // Get tournaments by game
  getTournamentsByGame: async (
    gameId: string,
    status?: string,
    limit = 10
  ): Promise<Tournament[]> => {
    const response = await apiClient.get<ApiResponse<Tournament[]>>(
      `/api/v1/games/${gameId}/tournaments`,
      { params: { status, limit } }
    )
    return response.data.data
  },
}

export default tournamentsApi