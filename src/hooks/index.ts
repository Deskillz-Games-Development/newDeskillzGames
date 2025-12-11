// Wallet hooks
export { useWallet, useTokenBalance, useIsSupportedChain, useWalletStatus } from './useWallet'

// Auth hooks
export { useWalletAuth, useCurrentUser, useAuthStore, useNeedsRegistration } from './useAuth'

// Data hooks
export {
  useGames,
  useFeaturedGames,
  useGame,
  useGameStats,
  useGamesByGenre,
  useGenres,
  useSearchGames,
  useRateGame,
  gameKeys,
} from './useGames'

export {
  useTournaments,
  useLiveTournaments,
  useUpcomingTournaments,
  useTournament,
  useTournamentLeaderboard,
  useTournamentParticipants,
  useTournamentsByGame,
  useJoinTournament,
  useLeaveTournament,
  useSubmitScore,
  tournamentKeys,
} from './useTournaments'

// Real-time hooks
export {
  useMatchmaking,
  useTournamentSocket,
  useNotifications,
  useGameplaySocket,
  useSocketConnection,
} from './useRealtime'