import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamesApi, type GameFilters } from '@/lib/api/games'

// Query keys
export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  list: (filters?: GameFilters) => [...gameKeys.lists(), filters] as const,
  featured: () => [...gameKeys.all, 'featured'] as const,
  genres: () => [...gameKeys.all, 'genres'] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (id: string) => [...gameKeys.details(), id] as const,
  stats: (id: string) => [...gameKeys.detail(id), 'stats'] as const,
}

// Hooks
export function useGames(filters?: GameFilters) {
  return useQuery({
    queryKey: gameKeys.list(filters),
    queryFn: () => gamesApi.getGames(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useFeaturedGames(limit = 6) {
  return useQuery({
    queryKey: gameKeys.featured(),
    queryFn: () => gamesApi.getFeaturedGames(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useGame(id: string) {
  return useQuery({
    queryKey: gameKeys.detail(id),
    queryFn: () => gamesApi.getGame(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGameStats(id: string) {
  return useQuery({
    queryKey: gameKeys.stats(id),
    queryFn: () => gamesApi.getGameStats(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes - stats update more frequently
  })
}

export function useGamesByGenre(genre: string, limit = 10) {
  return useQuery({
    queryKey: [...gameKeys.lists(), 'genre', genre],
    queryFn: () => gamesApi.getGamesByGenre(genre, limit),
    enabled: !!genre,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGenres() {
  return useQuery({
    queryKey: gameKeys.genres(),
    queryFn: () => gamesApi.getGenres(),
    staleTime: 1000 * 60 * 60, // 1 hour - genres rarely change
  })
}

export function useSearchGames(query: string, limit = 10) {
  return useQuery({
    queryKey: [...gameKeys.lists(), 'search', query],
    queryFn: () => gamesApi.searchGames(query, limit),
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  })
}

export function useRateGame() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      gamesApi.rateGame(id, rating),
    onSuccess: (_, { id }) => {
      // Invalidate game stats after rating
      queryClient.invalidateQueries({ queryKey: gameKeys.stats(id) })
    },
  })
}