import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Users,
  Clock,
  Zap,
  CheckCircle2,
  Swords,
  Crown,
  Target,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Match states
type MatchState = 'lobby' | 'searching' | 'found' | 'ready_check' | 'starting' | 'playing'

// Mock player data
const mockCurrentPlayer = {
  id: '1',
  username: 'ProGamer_X',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  tier: 'Gold',
  rating: 1450,
  wins: 47,
  winRate: 62,
  level: 24,
}

const mockOpponent = {
  id: '2',
  username: 'SkillMaster99',
  avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop',
  tier: 'Gold',
  rating: 1480,
  wins: 52,
  winRate: 58,
  level: 26,
}

const mockTournament = {
  id: '1',
  name: 'Speed Racer Championship',
  game: {
    id: '1',
    name: 'Speed Racer X',
    icon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
  },
  entryFee: 5,
  prizePool: 45,
  currency: 'USDT',
  mode: 'sync',
  maxPlayers: 2,
  currentPlayers: 1,
  matchDuration: 180, // 3 minutes
}

// Tier colors
const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: 'from-orange-600 to-orange-800', text: 'text-orange-400', border: 'border-orange-500/50' },
  Silver: { bg: 'from-gray-400 to-gray-600', text: 'text-gray-300', border: 'border-gray-400/50' },
  Gold: { bg: 'from-yellow-500 to-amber-600', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  Platinum: { bg: 'from-cyan-400 to-blue-500', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  Diamond: { bg: 'from-purple-400 to-pink-500', text: 'text-purple-400', border: 'border-purple-500/50' },
}

export default function MatchmakingPage() {
  const { tournamentId } = useParams()
  const navigate = useNavigate()
  
  const [matchState, setMatchState] = useState<MatchState>('lobby')
  const [searchTime, setSearchTime] = useState(0)
  const [countdown, setCountdown] = useState(10)
  const [playerReady, setPlayerReady] = useState(false)
  const [opponentReady, setOpponentReady] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Simulate matchmaking search
  useEffect(() => {
    if (matchState === 'searching') {
      const timer = setInterval(() => {
        setSearchTime(prev => prev + 1)
      }, 1000)

      // Simulate finding opponent after 3-8 seconds
      const findTime = Math.random() * 5000 + 3000
      const findTimer = setTimeout(() => {
        setMatchState('found')
        // After 2 seconds showing "found", move to ready check
        setTimeout(() => setMatchState('ready_check'), 2000)
      }, findTime)

      return () => {
        clearInterval(timer)
        clearTimeout(findTimer)
      }
    }
  }, [matchState])

  // Ready check countdown
  useEffect(() => {
    if (matchState === 'ready_check') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Time's up - check if both ready
            if (playerReady) {
              setMatchState('starting')
            } else {
              // Return to lobby if not ready
              setMatchState('lobby')
              setPlayerReady(false)
              setOpponentReady(false)
              setCountdown(10)
            }
            return 10
          }
          return prev - 1
        })
      }, 1000)

      // Simulate opponent ready after 2-4 seconds
      const opponentReadyTimer = setTimeout(() => {
        setOpponentReady(true)
      }, Math.random() * 2000 + 2000)

      return () => {
        clearInterval(timer)
        clearTimeout(opponentReadyTimer)
      }
    }
  }, [matchState, playerReady])

  // Start match countdown
  useEffect(() => {
    if (matchState === 'starting') {
      setCountdown(5)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setMatchState('playing')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [matchState])

  // Handle play button click
  useEffect(() => {
    if (matchState === 'playing') {
      // Navigate to actual game
      setTimeout(() => {
        navigate(`/tournaments/${tournamentId}/play`)
      }, 500)
    }
  }, [matchState, tournamentId, navigate])

  const handleFindMatch = useCallback(() => {
    setMatchState('searching')
    setSearchTime(0)
  }, [])

  const handleCancelSearch = useCallback(() => {
    setMatchState('lobby')
    setSearchTime(0)
  }, [])

  const handleReady = useCallback(() => {
    setPlayerReady(true)
    // Check if both ready
    if (opponentReady) {
      setMatchState('starting')
    }
  }, [opponentReady])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen py-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gaming-dark via-gaming-darker to-gaming-dark" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <img 
                src={mockTournament.game.icon} 
                alt={mockTournament.game.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h1 className="font-display text-2xl font-bold text-white">
                {mockTournament.name}
              </h1>
              <p className="text-white/50 text-sm">{mockTournament.game.name}</p>
            </div>
          </div>

          {/* Tournament info bar */}
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-gaming-light/50 rounded-xl border border-gaming-border">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-neon-green" />
              <span className="text-neon-green font-semibold">{mockTournament.prizePool} {mockTournament.currency}</span>
            </div>
            <div className="w-px h-4 bg-gaming-border" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-cyan" />
              <span className="text-white/70">{mockTournament.entryFee} {mockTournament.currency} Entry</span>
            </div>
            <div className="w-px h-4 bg-gaming-border" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/50" />
              <span className="text-white/70">{formatTime(mockTournament.matchDuration)}</span>
            </div>
          </div>
        </motion.div>

        {/* Main content based on state */}
        <AnimatePresence mode="wait">
          {matchState === 'lobby' && (
            <LobbyView
              key="lobby"
              player={mockCurrentPlayer}
              tournament={mockTournament}
              onFindMatch={handleFindMatch}
            />
          )}

          {matchState === 'searching' && (
            <SearchingView
              key="searching"
              player={mockCurrentPlayer}
              searchTime={searchTime}
              onCancel={handleCancelSearch}
            />
          )}

          {matchState === 'found' && (
            <MatchFoundView
              key="found"
              player={mockCurrentPlayer}
              opponent={mockOpponent}
            />
          )}

          {matchState === 'ready_check' && (
            <ReadyCheckView
              key="ready_check"
              player={mockCurrentPlayer}
              opponent={mockOpponent}
              playerReady={playerReady}
              opponentReady={opponentReady}
              countdown={countdown}
              onReady={handleReady}
            />
          )}

          {(matchState === 'starting' || matchState === 'playing') && (
            <StartingView
              key="starting"
              player={mockCurrentPlayer}
              opponent={mockOpponent}
              countdown={countdown}
            />
          )}
        </AnimatePresence>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="fixed bottom-6 right-6 p-3 bg-gaming-light border border-gaming-border rounded-xl hover:border-neon-cyan/30 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-white/70" />
          ) : (
            <VolumeX className="w-5 h-5 text-white/30" />
          )}
        </button>
      </div>
    </div>
  )
}

// Lobby View Component
function LobbyView({ 
  player, 
  tournament, 
  onFindMatch 
}: { 
  player: typeof mockCurrentPlayer
  tournament: typeof mockTournament
  onFindMatch: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="font-display text-xl font-semibold text-white mb-2">
            Ready to Compete?
          </h2>
          <p className="text-white/50">
            You'll be matched with an opponent of similar skill level
          </p>
        </div>

        {/* Player card */}
        <div className="max-w-sm mx-auto mb-8">
          <PlayerCard player={player} size="large" />
        </div>

        {/* Match info */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          <div className="text-center p-4 bg-gaming-darker rounded-xl">
            <Users className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
            <div className="text-2xl font-display font-bold text-white">1v1</div>
            <div className="text-xs text-white/50">Match Type</div>
          </div>
          <div className="text-center p-4 bg-gaming-darker rounded-xl">
            <Trophy className="w-6 h-6 text-neon-green mx-auto mb-2" />
            <div className="text-2xl font-display font-bold text-neon-green">
              {tournament.prizePool}
            </div>
            <div className="text-xs text-white/50">Prize Pool</div>
          </div>
          <div className="text-center p-4 bg-gaming-darker rounded-xl">
            <Clock className="w-6 h-6 text-neon-purple mx-auto mb-2" />
            <div className="text-2xl font-display font-bold text-white">3:00</div>
            <div className="text-xs text-white/50">Match Time</div>
          </div>
        </div>

        {/* Find match button */}
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onFindMatch}
            className="px-12 py-4 text-lg"
            leftIcon={<Swords className="w-5 h-5" />}
          >
            Find Opponent
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// Searching View Component
function SearchingView({
  player,
  searchTime,
  onCancel,
}: {
  player: typeof mockCurrentPlayer
  searchTime: number
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 text-center">
        {/* Searching animation */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-neon-cyan/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          {/* Middle ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-4 border-neon-purple/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute inset-8 rounded-full border-4 border-neon-green/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Player avatar */}
          <div className="absolute inset-12 rounded-full overflow-hidden border-4 border-neon-cyan">
            <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
          </div>
          {/* Scanning line */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 245, 212, 0.3) 60deg, transparent 120deg)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Searching for Opponent
        </h2>
        <p className="text-white/50 mb-4">
          Finding a worthy challenger...
        </p>

        {/* Search time */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gaming-darker rounded-lg mb-8">
          <Clock className="w-4 h-4 text-white/50" />
          <span className="font-mono text-white">{searchTime}s</span>
        </div>

        {/* Rating range info */}
        <div className="max-w-sm mx-auto mb-8 p-4 bg-gaming-darker rounded-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Rating Range</span>
            <span className="text-white">
              {player.rating - 100} - {player.rating + 100}
            </span>
          </div>
          <div className="mt-2 h-2 bg-gaming-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
              initial={{ width: '30%' }}
              animate={{ width: ['30%', '70%', '30%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-white/50 hover:text-white"
        >
          Cancel Search
        </Button>
      </Card>
    </motion.div>
  )
}

// Match Found View Component
function MatchFoundView({
  player,
  opponent,
}: {
  player: typeof mockCurrentPlayer
  opponent: typeof mockOpponent
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <Card className="p-8 text-center overflow-hidden relative">
        {/* Flash effect */}
        <motion.div
          className="absolute inset-0 bg-neon-cyan/20"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-neon-green/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-neon-green" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl font-bold text-neon-cyan mb-8"
        >
          OPPONENT FOUND!
        </motion.h2>

        {/* VS Display */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <PlayerCard player={player} />
          </motion.div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-red to-orange-500 flex items-center justify-center">
              <span className="font-display text-xl font-bold text-white">VS</span>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-neon-red/50"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <PlayerCard player={opponent} />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/50"
        >
          Get ready for the ready check...
        </motion.p>
      </Card>
    </motion.div>
  )
}

// Ready Check View Component
function ReadyCheckView({
  player,
  opponent,
  playerReady,
  opponentReady,
  countdown,
  onReady,
}: {
  player: typeof mockCurrentPlayer
  opponent: typeof mockOpponent
  playerReady: boolean
  opponentReady: boolean
  countdown: number
  onReady: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8">
        {/* Countdown */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border-4 border-neon-cyan/50 mb-4">
            <span className="font-display text-4xl font-bold text-white">{countdown}</span>
          </div>
          <h2 className="font-display text-xl font-semibold text-white">
            Ready Check
          </h2>
          <p className="text-white/50 text-sm">
            Both players must accept to start the match
          </p>
        </div>

        {/* Players ready status */}
        <div className="flex items-center justify-center gap-12 mb-8">
          {/* Current player */}
          <div className="text-center">
            <div className="relative mb-4">
              <div className={cn(
                'w-24 h-24 rounded-full overflow-hidden border-4 transition-colors',
                playerReady ? 'border-neon-green' : 'border-gaming-border'
              )}>
                <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
              </div>
              {playerReady && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-neon-green flex items-center justify-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-gaming-dark" />
                </motion.div>
              )}
            </div>
            <div className="font-semibold text-white">{player.username}</div>
            <div className={cn(
              'text-sm font-medium',
              playerReady ? 'text-neon-green' : 'text-white/50'
            )}>
              {playerReady ? 'READY' : 'Waiting...'}
            </div>
          </div>

          {/* VS */}
          <div className="w-12 h-12 rounded-full bg-gaming-darker flex items-center justify-center">
            <Swords className="w-6 h-6 text-white/50" />
          </div>

          {/* Opponent */}
          <div className="text-center">
            <div className="relative mb-4">
              <div className={cn(
                'w-24 h-24 rounded-full overflow-hidden border-4 transition-colors',
                opponentReady ? 'border-neon-green' : 'border-gaming-border'
              )}>
                <img src={opponent.avatar} alt={opponent.username} className="w-full h-full object-cover" />
              </div>
              {opponentReady && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-neon-green flex items-center justify-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-gaming-dark" />
                </motion.div>
              )}
            </div>
            <div className="font-semibold text-white">{opponent.username}</div>
            <div className={cn(
              'text-sm font-medium',
              opponentReady ? 'text-neon-green' : 'text-white/50'
            )}>
              {opponentReady ? 'READY' : 'Waiting...'}
            </div>
          </div>
        </div>

        {/* Ready button */}
        <div className="text-center">
          {!playerReady ? (
            <Button
              variant="primary"
              size="lg"
              onClick={onReady}
              className="px-12 py-4 text-lg animate-pulse"
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Accept Match
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-neon-green">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Waiting for opponent...</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// Starting View Component
function StartingView({
  player,
  opponent,
  countdown,
}: {
  player: typeof mockCurrentPlayer
  opponent: typeof mockOpponent
  countdown: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <Card className="p-8 overflow-hidden relative">
        {/* Pulse effect background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-transparent to-neon-purple/10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        <div className="relative z-10">
          {/* Match details header */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Match Starting
            </h2>
            <p className="text-white/50">Get ready to play!</p>
          </div>

          {/* Players VS display */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <PlayerCard player={player} showStats />
            
            <div className="text-center">
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center mb-2"
              >
                <span className="font-display text-4xl font-bold text-white">
                  {countdown}
                </span>
              </motion.div>
              <span className="text-white/50 text-sm">seconds</span>
            </div>

            <PlayerCard player={opponent} showStats />
          </div>

          {/* Match info */}
          <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
            <div className="p-3 bg-gaming-darker rounded-lg text-center">
              <Trophy className="w-5 h-5 text-neon-green mx-auto mb-1" />
              <div className="font-semibold text-white">45 USDT</div>
              <div className="text-xs text-white/50">Prize</div>
            </div>
            <div className="p-3 bg-gaming-darker rounded-lg text-center">
              <Clock className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
              <div className="font-semibold text-white">3:00</div>
              <div className="text-xs text-white/50">Duration</div>
            </div>
            <div className="p-3 bg-gaming-darker rounded-lg text-center">
              <Target className="w-5 h-5 text-neon-purple mx-auto mb-1" />
              <div className="font-semibold text-white">Best Score</div>
              <div className="text-xs text-white/50">Win Condition</div>
            </div>
            <div className="p-3 bg-gaming-darker rounded-lg text-center">
              <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="font-semibold text-white">Real-time</div>
              <div className="text-xs text-white/50">Mode</div>
            </div>
          </div>

          {/* Loading bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="h-2 bg-gaming-darker rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            </div>
            <p className="text-white/30 text-sm mt-2">Loading game assets...</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Player Card Component
function PlayerCard({ 
  player, 
  size = 'medium',
  showStats = false,
}: { 
  player: typeof mockCurrentPlayer
  size?: 'medium' | 'large'
  showStats?: boolean
}) {
  const tier = tierColors[player.tier] || tierColors.Bronze
  const avatarSize = size === 'large' ? 'w-24 h-24' : 'w-16 h-16'

  return (
    <div className={cn(
      'p-4 bg-gaming-darker rounded-xl text-center',
      size === 'large' && 'p-6'
    )}>
      {/* Avatar */}
      <div className={cn('relative mx-auto mb-3', avatarSize)}>
        <div className={cn(
          'w-full h-full rounded-full overflow-hidden border-2',
          tier.border
        )}>
          <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
        </div>
        {/* Level badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gaming-light border border-gaming-border flex items-center justify-center">
          <span className="text-xs font-bold text-white">{player.level}</span>
        </div>
      </div>

      {/* Name */}
      <div className="font-display font-semibold text-white mb-1">
        {player.username}
      </div>

      {/* Tier badge */}
      <div className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r',
        tier.bg
      )}>
        <Crown className="w-3 h-3" />
        {player.tier}
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gaming-border">
          <div>
            <div className="text-lg font-bold text-white">{player.rating}</div>
            <div className="text-xs text-white/50">Rating</div>
          </div>
          <div>
            <div className="text-lg font-bold text-neon-green">{player.winRate}%</div>
            <div className="text-xs text-white/50">Win Rate</div>
          </div>
        </div>
      )}
    </div>
  )
}