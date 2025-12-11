import { useEffect, createContext, useContext, ReactNode } from 'react'
import { useSocketStore } from '@/lib/socket'
import { useAuthStore } from '@/hooks/useAuth'
import { tokenManager } from '@/lib/api-client'

// =============================================================================
// SOCKET CONTEXT
// =============================================================================

interface SocketContextValue {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

const SocketContext = createContext<SocketContextValue>({
  isConnected: false,
  isConnecting: false,
  error: null,
})

export function useSocketContext() {
  return useContext(SocketContext)
}

// =============================================================================
// SOCKET PROVIDER
// =============================================================================

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated } = useAuthStore()
  const { connect, disconnect, isConnected, isConnecting, error } = useSocketStore()
  
  // Auto-connect when authenticated
  useEffect(() => {
    const token = tokenManager.getAccessToken()
    
    if (isAuthenticated && token) {
      connect(token)
    } else {
      disconnect()
    }
    
    return () => {
      disconnect()
    }
  }, [isAuthenticated, connect, disconnect])
  
  // Handle visibility change (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const token = tokenManager.getAccessToken()
      
      if (document.visibilityState === 'visible' && isAuthenticated && token && !isConnected) {
        connect(token)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, isConnected, connect])
  
  return (
    <SocketContext.Provider value={{ isConnected, isConnecting, error }}>
      {children}
    </SocketContext.Provider>
  )
}

// =============================================================================
// CONNECTION STATUS INDICATOR
// =============================================================================

export function ConnectionStatus() {
  const { isConnected, isConnecting } = useSocketContext()
  
  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-sm">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span>Connecting...</span>
      </div>
    )
  }
  
  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <span>Offline</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2 text-neon-green text-sm">
      <div className="w-2 h-2 rounded-full bg-neon-green" />
      <span>Connected</span>
    </div>
  )
}