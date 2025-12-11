import { useEffect, useCallback, useRef } from 'react'
import { useSocketStore, MatchFoundData, TournamentUpdateData, LeaderboardUpdateData, NotificationData } from '@/lib/socket'
import { create } from 'zustand'

// =============================================================================
// MATCHMAKING HOOK
// =============================================================================

interface UseMatchmakingOptions {
  onMatchFound?: (data: MatchFoundData) => void
  onReadyCheck?: (data: { matchId: string; timeout: number }) => void
  onMatchStart?: (data: { matchId: string }) => void
  onCancelled?: (reason: string) => void
}

export function useMatchmaking(options: UseMatchmakingOptions = {}) {
  const {
    socket,
    isConnected,
    matchmaking,
    joinMatchmaking,
    leaveMatchmaking,
    confirmReady,
    resetMatchmaking,
  } = useSocketStore()
  
  const optionsRef = useRef(options)
  optionsRef.current = options
  
  // Set up event listeners
  useEffect(() => {
    if (!socket) return
    
    const handleMatchFound = (data: MatchFoundData) => {
      optionsRef.current.onMatchFound?.(data)
    }
    
    const handleReadyCheck = (data: { matchId: string; timeout: number }) => {
      optionsRef.current.onReadyCheck?.(data)
    }
    
    const handleMatchStart = (data: { matchId: string; countdown: number }) => {
      optionsRef.current.onMatchStart?.(data)
    }
    
    const handleCancelled = (data: { reason: string }) => {
      optionsRef.current.onCancelled?.(data.reason)
    }
    
    socket.on('matchmaking:found', handleMatchFound)
    socket.on('matchmaking:ready_check', handleReadyCheck)
    socket.on('matchmaking:starting', handleMatchStart)
    socket.on('matchmaking:cancelled', handleCancelled)
    
    return () => {
      socket.off('matchmaking:found', handleMatchFound)
      socket.off('matchmaking:ready_check', handleReadyCheck)
      socket.off('matchmaking:starting', handleMatchStart)
      socket.off('matchmaking:cancelled', handleCancelled)
    }
  }, [socket])
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (matchmaking.isSearching) {
        leaveMatchmaking()
      }
    }
  }, [])
  
  const startSearching = useCallback((gameId: string, tournamentId?: string) => {
    if (!isConnected) {
      console.warn('[Matchmaking] Not connected to server')
      return
    }
    joinMatchmaking(gameId, tournamentId)
  }, [isConnected, joinMatchmaking])
  
  const cancelSearch = useCallback(() => {
    leaveMatchmaking()
  }, [leaveMatchmaking])
  
  const ready = useCallback((matchId: string) => {
    confirmReady(matchId)
  }, [confirmReady])
  
  return {
    isSearching: matchmaking.isSearching,
    queuePosition: matchmaking.queuePosition,
    estimatedWait: matchmaking.estimatedWait,
    matchFound: matchmaking.matchFound,
    readyCheck: matchmaking.readyCheck,
    playersReady: matchmaking.playersReady,
    startSearching,
    cancelSearch,
    ready,
    reset: resetMatchmaking,
    isConnected,
  }
}

// =============================================================================
// TOURNAMENT SOCKET HOOK
// =============================================================================

interface TournamentSocketState {
  tournaments: Map<string, TournamentUpdateData>
  leaderboards: Map<string, LeaderboardUpdateData>
  updateTournament: (data: TournamentUpdateData) => void
  updateLeaderboard: (data: LeaderboardUpdateData) => void
}

const useTournamentSocketStore = create<TournamentSocketState>((set) => ({
  tournaments: new Map(),
  leaderboards: new Map(),
  
  updateTournament: (data) => {
    set((state) => {
      const newMap = new Map(state.tournaments)
      newMap.set(data.tournamentId, data)
      return { tournaments: newMap }
    })
  },
  
  updateLeaderboard: (data) => {
    set((state) => {
      const key = data.tournamentId || data.gameId || 'global'
      const newMap = new Map(state.leaderboards)
      newMap.set(key, data)
      return { leaderboards: newMap }
    })
  },
}))

interface UseTournamentSocketOptions {
  tournamentId: string
  onUpdate?: (data: TournamentUpdateData) => void
  onPlayerJoined?: (data: { odid: string; username: string; playerCount: number }) => void
  onPlayerLeft?: (data: { odid: string; username: string; playerCount: number }) => void
  onStarting?: (countdown: number) => void
  onStarted?: () => void
  onEnded?: (data: { winners: Array<{ username: string; place: number; prize: number }> }) => void
  onScoreSubmitted?: (data: { username: string; score: number; rank: number }) => void
  onLeaderboardUpdate?: (data: LeaderboardUpdateData) => void
}

export function useTournamentSocket(options: UseTournamentSocketOptions) {
  const { tournamentId, ...callbacks } = options
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks
  
  const { socket, isConnected, subscribeTournament, unsubscribeTournament } = useSocketStore()
  const { tournaments, leaderboards, updateTournament, updateLeaderboard } = useTournamentSocketStore()
  
  // Subscribe to tournament on mount
  useEffect(() => {
    if (!socket || !isConnected || !tournamentId) return
    
    subscribeTournament(tournamentId)
    
    return () => {
      unsubscribeTournament(tournamentId)
    }
  }, [socket, isConnected, tournamentId, subscribeTournament, unsubscribeTournament])
  
  // Set up event listeners
  useEffect(() => {
    if (!socket) return
    
    const handleUpdate = (data: TournamentUpdateData) => {
      if (data.tournamentId === tournamentId) {
        updateTournament(data)
        callbacksRef.current.onUpdate?.(data)
      }
    }
    
    const handlePlayerJoined = (data: { odid: string; username: string; playerCount: number }) => {
      callbacksRef.current.onPlayerJoined?.(data)
    }
    
    const handlePlayerLeft = (data: { odid: string; username: string; playerCount: number }) => {
      callbacksRef.current.onPlayerLeft?.(data)
    }
    
    const handleStarting = (data: { tournamentId: string; countdown: number }) => {
      if (data.tournamentId === tournamentId) {
        callbacksRef.current.onStarting?.(data.countdown)
      }
    }
    
    const handleStarted = (data: { tournamentId: string }) => {
      if (data.tournamentId === tournamentId) {
        callbacksRef.current.onStarted?.()
      }
    }
    
    const handleEnded = (data: any) => {
      if (data.tournamentId === tournamentId) {
        callbacksRef.current.onEnded?.(data)
      }
    }
    
    const handleScoreSubmitted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        callbacksRef.current.onScoreSubmitted?.(data)
      }
    }
    
    const handleLeaderboard = (data: LeaderboardUpdateData) => {
      if (data.tournamentId === tournamentId) {
        updateLeaderboard(data)
        callbacksRef.current.onLeaderboardUpdate?.(data)
      }
    }
    
    socket.on('tournament:update', handleUpdate)
    socket.on('tournament:player_joined', handlePlayerJoined)
    socket.on('tournament:player_left', handlePlayerLeft)
    socket.on('tournament:starting', handleStarting)
    socket.on('tournament:started', handleStarted)
    socket.on('tournament:ended', handleEnded)
    socket.on('tournament:score_submitted', handleScoreSubmitted)
    socket.on('leaderboard:update', handleLeaderboard)
    
    return () => {
      socket.off('tournament:update', handleUpdate)
      socket.off('tournament:player_joined', handlePlayerJoined)
      socket.off('tournament:player_left', handlePlayerLeft)
      socket.off('tournament:starting', handleStarting)
      socket.off('tournament:started', handleStarted)
      socket.off('tournament:ended', handleEnded)
      socket.off('tournament:score_submitted', handleScoreSubmitted)
      socket.off('leaderboard:update', handleLeaderboard)
    }
  }, [socket, tournamentId, updateTournament, updateLeaderboard])
  
  return {
    tournament: tournaments.get(tournamentId),
    leaderboard: leaderboards.get(tournamentId),
    isConnected,
  }
}

// =============================================================================
// NOTIFICATIONS HOOK
// =============================================================================

interface UseNotificationsOptions {
  onNotification?: (notification: NotificationData) => void
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const optionsRef = useRef(options)
  optionsRef.current = options
  
  const { socket } = useSocketStore()
  const {
    notifications,
    unreadCount,
    addNotification,
    markNotificationsRead,
    clearNotifications,
  } = useSocketStore()
  
  // Set up notification listener
  useEffect(() => {
    if (!socket) return
    
    const handleNotification = (data: NotificationData) => {
      optionsRef.current.onNotification?.(data)
    }
    
    socket.on('notification', handleNotification)
    
    return () => {
      socket.off('notification', handleNotification)
    }
  }, [socket])
  
  return {
    notifications,
    unreadCount,
    markRead: markNotificationsRead,
    clear: clearNotifications,
    add: addNotification,
  }
}

// =============================================================================
// GAMEPLAY SOCKET HOOK
// =============================================================================

interface UseGameplaySocketOptions {
  matchId: string
  onOpponentScore?: (score: number) => void
  onOpponentState?: (state: unknown) => void
  onGameEnd?: () => void
}

export function useGameplaySocket(options: UseGameplaySocketOptions) {
  const { matchId, ...callbacks } = options
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks
  
  const { socket, isConnected } = useSocketStore()
  
  // Send score update
  const sendScoreUpdate = useCallback((score: number) => {
    if (socket?.connected) {
      socket.emit('game:score_update', { matchId, score })
    }
  }, [socket, matchId])
  
  // Send state sync (for real-time games)
  const sendStateSync = useCallback((state: unknown) => {
    if (socket?.connected) {
      socket.emit('game:state_sync', { matchId, state })
    }
  }, [socket, matchId])
  
  // Complete game
  const completeGame = useCallback((finalScore: number) => {
    if (socket?.connected) {
      socket.emit('game:complete', { matchId, finalScore })
    }
  }, [socket, matchId])
  
  return {
    isConnected,
    sendScoreUpdate,
    sendStateSync,
    completeGame,
  }
}

// =============================================================================
// CONNECTION STATUS HOOK
// =============================================================================

export function useSocketConnection() {
  const { isConnected, isConnecting, error, connect, disconnect } = useSocketStore()
  
  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  }
}