import { io, Socket } from 'socket.io-client'
import { create } from 'zustand'

// =============================================================================
// EVENT TYPES
// =============================================================================

export interface ServerToClientEvents {
  // Connection
  'connect': () => void
  'disconnect': (reason: string) => void
  'error': (error: { message: string; code?: string }) => void

  // Matchmaking
  'matchmaking:searching': (data: { queuePosition: number; estimatedWait: number }) => void
  'matchmaking:found': (data: MatchFoundData) => void
  'matchmaking:ready_check': (data: { matchId: string; timeout: number }) => void
  'matchmaking:player_ready': (data: { odid: string; username: string }) => void
  'matchmaking:cancelled': (data: { reason: string }) => void
  'matchmaking:starting': (data: { matchId: string; countdown: number }) => void

  // Tournament
  'tournament:update': (data: TournamentUpdateData) => void
  'tournament:player_joined': (data: { odid: string; username: string; playerCount: number }) => void
  'tournament:player_left': (data: { odid: string; username: string; playerCount: number }) => void
  'tournament:starting': (data: { tournamentId: string; countdown: number }) => void
  'tournament:started': (data: { tournamentId: string }) => void
  'tournament:ended': (data: TournamentEndedData) => void
  'tournament:score_submitted': (data: ScoreSubmittedData) => void

  // Leaderboard
  'leaderboard:update': (data: LeaderboardUpdateData) => void

  // Notifications
  'notification': (data: NotificationData) => void

  // Chat (optional)
  'chat:message': (data: ChatMessageData) => void
}

export interface ClientToServerEvents {
  // Matchmaking
  'matchmaking:join': (data: { gameId: string; tournamentId?: string }) => void
  'matchmaking:leave': () => void
  'matchmaking:ready': (data: { matchId: string }) => void

  // Tournament
  'tournament:join': (data: { tournamentId: string }) => void
  'tournament:leave': (data: { tournamentId: string }) => void
  'tournament:subscribe': (data: { tournamentId: string }) => void
  'tournament:unsubscribe': (data: { tournamentId: string }) => void

  // Gameplay
  'game:score_update': (data: { matchId: string; score: number }) => void
  'game:state_sync': (data: { matchId: string; state: unknown }) => void
  'game:complete': (data: { matchId: string; finalScore: number }) => void

  // Chat
  'chat:send': (data: { roomId: string; message: string }) => void
  'chat:join_room': (data: { roomId: string }) => void
  'chat:leave_room': (data: { roomId: string }) => void
}

// =============================================================================
// DATA TYPES
// =============================================================================

export interface MatchFoundData {
  matchId: string
  opponent: {
    odid: string
    username: string
    avatar: string
    tier: string
    rating: number
  }
  game: {
    id: string
    name: string
    icon: string
  }
  tournament?: {
    id: string
    name: string
    prizePool: number
  }
}

export interface TournamentUpdateData {
  tournamentId: string
  status: 'upcoming' | 'open' | 'in_progress' | 'completed' | 'cancelled'
  playerCount: number
  maxPlayers: number
  startsAt?: string
  endsAt?: string
}

export interface TournamentEndedData {
  tournamentId: string
  winners: Array<{
    odid: string
    username: string
    place: number
    prize: number
    score: number
  }>
  yourResult?: {
    place: number
    prize: number
    score: number
  }
}

export interface ScoreSubmittedData {
  tournamentId: string
  odid: string
  username: string
  score: number
  rank: number
  timestamp: string
}

export interface LeaderboardUpdateData {
  tournamentId?: string
  gameId?: string
  entries: Array<{
    rank: number
    odid: string
    username: string
    avatar: string
    score: number
    change: number
  }>
}

export interface NotificationData {
  id: string
  type: 'tournament_start' | 'tournament_end' | 'prize_won' | 'match_found' | 'system'
  title: string
  message: string
  data?: Record<string, unknown>
  createdAt: string
}

export interface ChatMessageData {
  id: string
  roomId: string
  sender: {
    odid: string
    username: string
    avatar: string
  }
  message: string
  timestamp: string
}

// =============================================================================
// SOCKET STORE
// =============================================================================

interface SocketState {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  
  // Matchmaking state
  matchmaking: {
    isSearching: boolean
    queuePosition: number
    estimatedWait: number
    matchFound: MatchFoundData | null
    readyCheck: { matchId: string; timeout: number } | null
    playersReady: string[]
  }
  
  // Notifications
  notifications: NotificationData[]
  unreadCount: number
  
  // Actions
  connect: (token: string) => void
  disconnect: () => void
  
  // Matchmaking actions
  joinMatchmaking: (gameId: string, tournamentId?: string) => void
  leaveMatchmaking: () => void
  confirmReady: (matchId: string) => void
  resetMatchmaking: () => void
  
  // Tournament actions
  subscribeTournament: (tournamentId: string) => void
  unsubscribeTournament: (tournamentId: string) => void
  
  // Notification actions
  addNotification: (notification: NotificationData) => void
  markNotificationsRead: () => void
  clearNotifications: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'https://api.deskillz.games'

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  
  matchmaking: {
    isSearching: false,
    queuePosition: 0,
    estimatedWait: 0,
    matchFound: null,
    readyCheck: null,
    playersReady: [],
  },
  
  notifications: [],
  unreadCount: 0,
  
  connect: (token: string) => {
    const { socket: existingSocket } = get()
    
    if (existingSocket?.connected) {
      return
    }
    
    set({ isConnecting: true, error: null })
    
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
    
    // Connection events
    socket.on('connect', () => {
      set({ isConnected: true, isConnecting: false, error: null })
      console.log('[Socket] Connected')
    })
    
    socket.on('disconnect', (reason) => {
      set({ isConnected: false })
      console.log('[Socket] Disconnected:', reason)
    })
    
    socket.on('error', (error) => {
      set({ error: error.message })
      console.error('[Socket] Error:', error)
    })
    
    // Matchmaking events
    socket.on('matchmaking:searching', (data) => {
      set((state) => ({
        matchmaking: {
          ...state.matchmaking,
          isSearching: true,
          queuePosition: data.queuePosition,
          estimatedWait: data.estimatedWait,
        }
      }))
    })
    
    socket.on('matchmaking:found', (data) => {
      set((state) => ({
        matchmaking: {
          ...state.matchmaking,
          isSearching: false,
          matchFound: data,
        }
      }))
    })
    
    socket.on('matchmaking:ready_check', (data) => {
      set((state) => ({
        matchmaking: {
          ...state.matchmaking,
          readyCheck: data,
          playersReady: [],
        }
      }))
    })
    
    socket.on('matchmaking:player_ready', (data) => {
      set((state) => ({
        matchmaking: {
          ...state.matchmaking,
          playersReady: [...state.matchmaking.playersReady, data.odid],
        }
      }))
    })
    
    socket.on('matchmaking:cancelled', (data) => {
      set((state) => ({
        matchmaking: {
          ...state.matchmaking,
          isSearching: false,
          matchFound: null,
          readyCheck: null,
          playersReady: [],
        }
      }))
      console.log('[Socket] Matchmaking cancelled:', data.reason)
    })
    
    // Notification events
    socket.on('notification', (data) => {
      set((state) => ({
        notifications: [data, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      }))
    })
    
    set({ socket })
  },
  
  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, isConnected: false })
    }
  },
  
  joinMatchmaking: (gameId: string, tournamentId?: string) => {
    const { socket } = get()
    if (socket?.connected) {
      socket.emit('matchmaking:join', { gameId, tournamentId })
      set((state) => ({
        matchmaking: {
          ...state.matchmaking,
          isSearching: true,
        }
      }))
    }
  },
  
  leaveMatchmaking: () => {
    const { socket } = get()
    if (socket?.connected) {
      socket.emit('matchmaking:leave')
      set((state) => ({
        matchmaking: {
          ...state.matchmaking,
          isSearching: false,
          matchFound: null,
          readyCheck: null,
        }
      }))
    }
  },
  
  confirmReady: (matchId: string) => {
    const { socket } = get()
    if (socket?.connected) {
      socket.emit('matchmaking:ready', { matchId })
    }
  },
  
  resetMatchmaking: () => {
    set({
      matchmaking: {
        isSearching: false,
        queuePosition: 0,
        estimatedWait: 0,
        matchFound: null,
        readyCheck: null,
        playersReady: [],
      }
    })
  },
  
  subscribeTournament: (tournamentId: string) => {
    const { socket } = get()
    if (socket?.connected) {
      socket.emit('tournament:subscribe', { tournamentId })
    }
  },
  
  unsubscribeTournament: (tournamentId: string) => {
    const { socket } = get()
    if (socket?.connected) {
      socket.emit('tournament:unsubscribe', { tournamentId })
    }
  },
  
  addNotification: (notification: NotificationData) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }))
  },
  
  markNotificationsRead: () => {
    set({ unreadCount: 0 })
  },
  
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },
}))

// =============================================================================
// SOCKET CONNECTION HOOK
// =============================================================================

export function useSocket() {
  const {
    socket,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useSocketStore()
  
  return {
    socket,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  }
}