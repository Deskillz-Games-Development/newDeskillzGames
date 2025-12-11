import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tournamentsApi, type TournamentFilters, type JoinTournamentRequest, type SubmitScoreRequest } from '@/lib/api/tournaments'
import toast from 'react-hot-toast'

// Query keys
export const tournamentKeys = {
  all: ['tournaments'] as const,
  lists: () => [...tournamentKeys.all, 'list'] as const,
  list: (filters?: TournamentFilters) => [...tournamentKeys.lists(), filters] as const,
  live: () => [...tournamentKeys.all, 'live'] as const,
  upcoming: () => [...tournamentKeys.all, 'upcoming'] as const,
  details: () => [...tournamentKeys.all, 'detail'] as const,
  detail: (id: string) => [...tournamentKeys.details(), id] as const,
  leaderboard: (id: string) => [...tournamentKeys.detail(id), 'leaderboard'] as const,
  participants: (id: string) => [...tournamentKeys.detail(id), 'participants'] as const,
  byGame: (gameId: string) => [...tournamentKeys.all, 'game', gameId] as const,
}

// Hooks
export function useTournaments(filters?: TournamentFilters) {
  return useQuery({
    queryKey: tournamentKeys.list(filters),
    queryFn: () => tournamentsApi.getTournaments(filters),
    staleTime: 1000 * 30, // 30 seconds - tournaments change frequently
  })
}

export function useLiveTournaments(limit = 10) {
  return useQuery({
    queryKey: tournamentKeys.live(),
    queryFn: () => tournamentsApi.getLiveTournaments(limit),
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds
  })
}

export function useUpcomingTournaments(limit = 10) {
  return useQuery({
    queryKey: tournamentKeys.upcoming(),
    queryFn: () => tournamentsApi.getUpcomingTournaments(limit),
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => tournamentsApi.getTournament(id),
    enabled: !!id,
    staleTime: 1000 * 15,
  })
}

export function useTournamentLeaderboard(id: string) {
  return useQuery({
    queryKey: tournamentKeys.leaderboard(id),
    queryFn: () => tournamentsApi.getLeaderboard(id),
    enabled: !!id,
    staleTime: 1000 * 10, // 10 seconds - leaderboards update frequently
    refetchInterval: 1000 * 15, // Auto-refetch every 15 seconds during active tournament
  })
}

export function useTournamentParticipants(id: string) {
  return useQuery({
    queryKey: tournamentKeys.participants(id),
    queryFn: () => tournamentsApi.getParticipants(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  })
}

export function useTournamentsByGame(gameId: string, status?: string, limit = 10) {
  return useQuery({
    queryKey: [...tournamentKeys.byGame(gameId), status],
    queryFn: () => tournamentsApi.getTournamentsByGame(gameId, status, limit),
    enabled: !!gameId,
    staleTime: 1000 * 30,
  })
}

// Mutations
export function useJoinTournament() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: JoinTournamentRequest) => tournamentsApi.joinTournament(data),
    onSuccess: (_, { tournamentId }) => {
      toast.success('Successfully joined tournament!')
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) })
      queryClient.invalidateQueries({ queryKey: tournamentKeys.participants(tournamentId) })
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to join tournament')
    },
  })
}

export function useLeaveTournament() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (tournamentId: string) => tournamentsApi.leaveTournament(tournamentId),
    onSuccess: (_, tournamentId) => {
      toast.success('Left tournament')
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) })
      queryClient.invalidateQueries({ queryKey: tournamentKeys.participants(tournamentId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to leave tournament')
    },
  })
}

export function useSubmitScore() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SubmitScoreRequest) => tournamentsApi.submitScore(data),
    onSuccess: (_, { tournamentId }) => {
      toast.success('Score submitted!')
      queryClient.invalidateQueries({ queryKey: tournamentKeys.leaderboard(tournamentId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit score')
    },
  })
}