import apiClient, { ApiResponse, PaginatedResponse } from '../api-client'
// Types
export interface Game {
  id: string
  developerId: string
  name: string
  description: string
  shortDescription?: string
  iconUrl: string
  bannerUrl?: string
  genre: string
  platform: 'mobile' | 'web' | 'both'
  sdkVersion: string
  status: 'pending' | 'approved' | 'rejected' | 'live'
  androidUrl?: string
  iosUrl?: string
  webUrl?: string
  demoEnabled: boolean
  minPlayers: number
  maxPlayers: number
  avgMatchDuration: number // in seconds
  createdAt: string
  updatedAt: string
  stats?: GameStats
  developer?: {
    id: string
    username: string
    avatarUrl?: string
  }
}

export interface GameStats {
  totalPlayers: number
  activeTournaments: number
  totalTournaments: number
  totalPrizePool: number
  avgRating: number
  totalRatings: number
}

export interface GameFilters {
  genre?: string
  platform?: string
  status?: string
  search?: string
  sortBy?: 'popular' | 'newest' | 'rating' | 'prizePool'
  page?: number
  limit?: number
}

// Games API
export const gamesApi = {
  // Get all games (with filters)
  getGames: async (filters?: GameFilters): Promise<PaginatedResponse<Game>> => {
    const response = await apiClient.get<PaginatedResponse<Game>>('/api/v1/games', {
      params: filters,
    })
    return response.data
  },

  // Get featured games
  getFeaturedGames: async (limit = 6): Promise<Game[]> => {
    const response = await apiClient.get<ApiResponse<Game[]>>('/api/v1/games/featured', {
      params: { limit },
    })
    return response.data.data
  },

  // Get single game by ID
  getGame: async (id: string): Promise<Game> => {
    const response = await apiClient.get<ApiResponse<Game>>(`/api/v1/games/${id}`)
    return response.data.data
  },

  // Get game stats
  getGameStats: async (id: string): Promise<GameStats> => {
    const response = await apiClient.get<ApiResponse<GameStats>>(`/api/v1/games/${id}/stats`)
    return response.data.data
  },

  // Get games by genre
  getGamesByGenre: async (genre: string, limit = 10): Promise<Game[]> => {
    const response = await apiClient.get<ApiResponse<Game[]>>(`/api/v1/games/genre/${genre}`, {
      params: { limit },
    })
    return response.data.data
  },

  // Get available genres
  getGenres: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/api/v1/games/genres')
    return response.data.data
  },

  // Rate a game
  rateGame: async (id: string, rating: number): Promise<void> => {
    await apiClient.post(`/api/v1/games/${id}/rate`, { rating })
  },

  // Search games
  searchGames: async (query: string, limit = 10): Promise<Game[]> => {
    const response = await apiClient.get<ApiResponse<Game[]>>('/api/v1/games/search', {
      params: { q: query, limit },
    })
    return response.data.data
  },
}

export default gamesApi