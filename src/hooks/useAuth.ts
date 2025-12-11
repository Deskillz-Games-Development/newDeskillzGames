import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSignMessage, useAccount } from 'wagmi'
import { useCallback, useEffect } from 'react'
import { authApi, type User, type LoginRequest, type RegisterRequest } from '@/lib/api/auth'
import { tokenManager } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Auth state store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => {
        tokenManager.clearTokens()
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'deskillz-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
  nonce: (address: string) => ['auth', 'nonce', address] as const,
}

// Get current user hook
export function useCurrentUser() {
  const { setUser } = useAuthStore()
  
  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const user = await authApi.getCurrentUser()
      setUser(user)
      return user
    },
    enabled: tokenManager.isAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })
}

// Wallet authentication hook
export function useWalletAuth() {
  const queryClient = useQueryClient()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { setUser, logout: storeLogout, user, isAuthenticated } = useAuthStore()

  // Get nonce for signing
  const getNonceMutation = useMutation({
    mutationFn: (walletAddress: string) => authApi.getNonce(walletAddress),
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (result) => {
      setUser(result.user)
      queryClient.setQueryData(authKeys.user, result.user)
      toast.success(`Welcome back, ${result.user.username}!`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed')
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (result) => {
      setUser(result.user)
      queryClient.setQueryData(authKeys.user, result.user)
      toast.success(`Welcome to Deskillz, ${result.user.username}!`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed')
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      storeLogout()
      queryClient.clear()
      toast.success('Logged out successfully')
    },
    onError: () => {
      // Still clear local state even if server call fails
      storeLogout()
      queryClient.clear()
    },
  })

  // Sign in with wallet
  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      // 1. Get nonce from server
      const nonceResponse = await getNonceMutation.mutateAsync(address)
      const message = nonceResponse.message
      
      // 2. Sign message with wallet
      const signature = await signMessageAsync({ message })
      
      // 3. Login with signature
      await loginMutation.mutateAsync({
        walletAddress: address,
        signature,
        message,
      })
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }, [address, isConnected, getNonceMutation, signMessageAsync, loginMutation])

  // Register with wallet
  const register = useCallback(async (username: string, email: string) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      // 1. Get nonce from server
      const nonceResponse = await getNonceMutation.mutateAsync(address)
      const message = nonceResponse.message
      
      // 2. Sign message with wallet
      const signature = await signMessageAsync({ message })
      
      // 3. Register with signature
      await registerMutation.mutateAsync({
        username,
        email,
        walletAddress: address,
        signature,
        message,
      })
    } catch (error) {
      console.error('Register error:', error)
    }
  }, [address, isConnected, getNonceMutation, signMessageAsync, registerMutation])

  // Logout
  const logout = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

  // Listen for auth:logout events (from API interceptor)
  useEffect(() => {
    const handleLogout = () => {
      storeLogout()
      queryClient.clear()
    }
    
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [storeLogout, queryClient])

  return {
    user,
    isAuthenticated,
    isLoading: getNonceMutation.isPending || loginMutation.isPending || registerMutation.isPending,
    signIn,
    register,
    logout,
  }
}

// Hook to check if user needs to register
export function useNeedsRegistration() {
  const { address } = useAccount()
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['auth', 'check', address],
    queryFn: async () => {
      if (!address) return { needsRegistration: false }
      try {
        await authApi.getNonce(address)
        return { needsRegistration: false }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return { needsRegistration: true }
        }
        throw error
      }
    },
    enabled: !!address && !isAuthenticated,
  })
}