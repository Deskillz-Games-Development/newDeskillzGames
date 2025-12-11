import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Clock,
  Pause,
  Play,
  Volume2,
  VolumeX,
  AlertTriangle,
  Crown,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Home,
  RotateCcw,
  Share2,
  X,
  Maximize2,
  Minimize2,
  Star,
  Medal
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Game states
type GameState = 'loading' | 'playing' | 'paused' | 'submitting' | 'results'

// Mock data
const mockMatch = {
  id: '1',
  tournamentId: '1',
  tournamentName: 'Speed Racer Championship',
  game: {
    id: '1',
    name: 'Speed Racer X',
    icon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    webUrl: 'https://example.com/game', // Game iframe URL
  },
  prizePool: 45,
  currency: 'USDT',
  entryFee: 5,
  matchDuration: 180, // 3 minutes in seconds
  mode: 'sync' as const,
}

const mockPlayer = {
  id: '1',
  username: 'ProGamer_X',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  tier: 'Gold',
  rating: 1450,
}

const mockOpponent = {
  id: '2',
  username: 'SkillMaster99',
  avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop',
  tier: 'Gold',
  rating: 1480,
}

// Tier colors
const tierColors: Record<string, string> = {
  Bronze: 'from-orange-600 to-orange-800',
  Silver: 'from-gray-400 to-gray-600',
  Gold: 'from-yellow-500 to-amber-600',
  Platinum: 'from-cyan-400 to-blue-500',
  Diamond: 'from-purple-400 to-pink-500',
}

export default function GameplayPage() {
  const { tournamentId } = useParams()
  const navigate = useNavigate()
  
  const [gameState, setGameState] = useState<GameState>('loading')
  const [timeRemaining, setTimeRemaining] = useState(mockMatch.matchDuration)
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [matchResult, setMatchResult] = useState<'win' | 'lose' | 'draw' | null>(null)
  const [ratingChange, setRatingChange] = useState(0)
  const [prizeWon, setPrizeWon] = useState(0)
  
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Simulate game loading
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setGameState('playing')
    }, 2000)
    return () => clearTimeout(loadTimer)
  }, [])

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleGameEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Simulate score updates (in real app, this comes from game iframe)
  useEffect(() => {
    if (gameState !== 'playing') return

    // Simulate random score increases
    const scoreInterval = setInterval(() => {
      // Player score
      if (Math.random() > 0.3) {
        setPlayerScore(prev => prev + Math.floor(Math.random() * 50) + 10)
      }
      // Opponent score (sync mode)
      if (mockMatch.mode === 'sync' && Math.random() > 0.35) {
        setOpponentScore(prev => prev + Math.floor(Math.random() * 45) + 10)
      }
    }, 2000)

    return () => clearInterval(scoreInterval)
  }, [gameState])

  // Handle game end
  const handleGameEnd = useCallback(() => {
    setGameState('submitting')
    
    // Simulate score submission delay
    setTimeout(() => {
      // Determine winner
      let result: 'win' | 'lose' | 'draw'
      if (playerScore > opponentScore) {
        result = 'win'
        setRatingChange(25)
        setPrizeWon(mockMatch.prizePool * 0.9) // 90% to winner after platform fee
      } else if (playerScore < opponentScore) {
        result = 'lose'
        setRatingChange(-15)
        setPrizeWon(0)
      } else {
        result = 'draw'
        setRatingChange(5)
        setPrizeWon(mockMatch.prizePool * 0.45) // Split prize
      }
      
      setMatchResult(result)
      setGameState('results')
    }, 1500)
  }, [playerScore, opponentScore])

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing')
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Handle quit
  const handleQuit = useCallback(() => {
    // In real app: forfeit match, lose entry fee
    navigate(`/tournaments/${tournamentId}`)
  }, [navigate, tournamentId])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Time warning threshold (30 seconds)
  const isTimeWarning = timeRemaining <= 30 && timeRemaining > 0

  return (
    <div 
      ref={gameContainerRef}
      className="min-h-screen bg-gaming-darker relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl" />
      </div>

      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="bg-gradient-to-b from-gaming-darker via-gaming-darker/90 to-transparent pb-8">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Player Info (Left) */}
              <div className="flex items-center gap-4">
                <PlayerHUD 
                  player={mockPlayer} 
                  score={playerScore}
                  isPlayer={true}
                />
              </div>

              {/* Center - Timer & Match Info */}
              <div className="flex flex-col items-center">
                {/* Timer */}
                <motion.div
                  className={cn(
                    'flex items-center gap-2 px-6 py-2 rounded-full border-2 transition-colors',
                    isTimeWarning 
                      ? 'bg-neon-red/20 border-neon-red text-neon-red' 
                      : 'bg-gaming-light/50 border-gaming-border text-white'
                  )}
                  animate={isTimeWarning ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isTimeWarning ? Infinity : 0 }}
                >
                  <Clock className={cn('w-5 h-5', isTimeWarning && 'animate-pulse')} />
                  <span className="font-mono text-2xl font-bold">
                    {formatTime(timeRemaining)}
                  </span>
                </motion.div>

                {/* VS indicator */}
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-white/50">{mockMatch.game.name}</span>
                  <span className="text-neon-cyan">•</span>
                  <span className="text-neon-green">{mockMatch.prizePool} {mockMatch.currency}</span>
                </div>
              </div>

              {/* Opponent Info (Right) - Sync mode only */}
              <div className="flex items-center gap-4">
                {mockMatch.mode === 'sync' ? (
                  <PlayerHUD 
                    player={mockOpponent} 
                    score={opponentScore}
                    isPlayer={false}
                  />
                ) : (
                  <div className="w-48" /> // Spacer for async mode
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="absolute inset-0 pt-28 pb-20">
        <div className="h-full max-w-6xl mx-auto px-4 relative">
          {/* Game Container */}
          <div className="h-full rounded-2xl overflow-hidden border-2 border-gaming-border bg-gaming-dark relative">
            {/* Loading State */}
            <AnimatePresence>
              {gameState === 'loading' && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gaming-darker flex flex-col items-center justify-center z-10"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-neon-cyan/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                      className="absolute inset-2 rounded-full border-4 border-neon-purple/30"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-4 rounded-full bg-gaming-light flex items-center justify-center">
                      <img 
                        src={mockMatch.game.icon} 
                        alt={mockMatch.game.name}
                        className="w-10 h-10 rounded-lg"
                      />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    Loading Game
                  </h3>
                  <p className="text-white/50">Preparing your match...</p>
                  
                  {/* Loading bar */}
                  <div className="w-64 h-2 bg-gaming-light rounded-full overflow-hidden mt-6">
                    <motion.div
                      className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pause Overlay */}
            <AnimatePresence>
              {gameState === 'paused' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gaming-darker/90 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-gaming-light border-4 border-neon-cyan flex items-center justify-center mx-auto mb-6">
                      <Pause className="w-10 h-10 text-neon-cyan" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-white mb-4">
                      PAUSED
                    </h2>
                    <p className="text-white/50 mb-8">
                      Time remaining: {formatTime(timeRemaining)}
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={togglePause}
                        leftIcon={<Play className="w-5 h-5" />}
                      >
                        Resume
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setShowQuitConfirm(true)}
                        className="text-neon-red hover:bg-neon-red/10"
                      >
                        Quit Match
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submitting Score Overlay */}
            <AnimatePresence>
              {gameState === 'submitting' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gaming-darker/95 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-4 border-neon-cyan border-t-transparent mb-6"
                  />
                  <h2 className="font-display text-2xl font-bold text-white mb-2">
                    Submitting Score
                  </h2>
                  <p className="text-white/50">
                    Your score: <span className="text-neon-cyan font-bold">{playerScore.toLocaleString()}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game iframe placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-gaming-dark to-gaming-darker flex items-center justify-center">
              {/* In production, this would be an iframe with the actual game */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-2xl bg-gaming-light/50 border border-gaming-border flex items-center justify-center mx-auto mb-4">
                  <img 
                    src={mockMatch.game.icon} 
                    alt={mockMatch.game.name}
                    className="w-20 h-20 rounded-xl"
                  />
                </div>
                <p className="text-white/50 text-lg">Game Area</p>
                <p className="text-white/30 text-sm mt-2">
                  {mockMatch.game.name} would load here
                </p>
                
                {/* Demo score buttons */}
                {gameState === 'playing' && (
                  <div className="mt-8 flex gap-4 justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlayerScore(prev => prev + 100)}
                      className="text-neon-green"
                    >
                      +100 Points (Demo)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGameEnd}
                      className="text-neon-red"
                    >
                      End Match (Demo)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-gradient-to-t from-gaming-darker via-gaming-darker/90 to-transparent pt-8">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Score Display */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm text-white/50 mb-1">Your Score</div>
                  <motion.div
                    key={playerScore}
                    initial={{ scale: 1.2, color: '#00F5D4' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="font-display text-3xl font-bold"
                  >
                    {playerScore.toLocaleString()}
                  </motion.div>
                </div>
                
                {mockMatch.mode === 'sync' && (
                  <>
                    <div className="w-px h-10 bg-gaming-border" />
                    <div className="text-center">
                      <div className="text-sm text-white/50 mb-1">Opponent</div>
                      <motion.div
                        key={opponentScore}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="font-display text-3xl font-bold text-white/70"
                      >
                        {opponentScore.toLocaleString()}
                      </motion.div>
                    </div>
                  </>
                )}
              </div>

              {/* Game Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-3 rounded-xl bg-gaming-light border border-gaming-border hover:border-white/20 transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-white/70" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-white/30" />
                  )}
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-3 rounded-xl bg-gaming-light border border-gaming-border hover:border-white/20 transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5 text-white/70" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-white/70" />
                  )}
                </button>
                
                <button
                  onClick={togglePause}
                  className="p-3 rounded-xl bg-gaming-light border border-gaming-border hover:border-neon-cyan/50 transition-colors"
                  disabled={gameState !== 'playing' && gameState !== 'paused'}
                >
                  {gameState === 'paused' ? (
                    <Play className="w-5 h-5 text-neon-cyan" />
                  ) : (
                    <Pause className="w-5 h-5 text-white/70" />
                  )}
                </button>
                
                <button
                  onClick={() => setShowQuitConfirm(true)}
                  className="p-3 rounded-xl bg-gaming-light border border-gaming-border hover:border-neon-red/50 hover:bg-neon-red/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70 hover:text-neon-red" />
                </button>
              </div>

              {/* Prize Pool */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-white/50 mb-1">Prize Pool</div>
                  <div className="font-display text-2xl font-bold text-neon-green">
                    {mockMatch.prizePool} {mockMatch.currency}
                  </div>
                </div>
                <Trophy className="w-8 h-8 text-neon-green" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowQuitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gaming-dark border border-gaming-border rounded-2xl p-8 max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-neon-red/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-neon-red" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  Quit Match?
                </h3>
                <p className="text-white/50 mb-6">
                  If you quit now, you'll forfeit this match and lose your entry fee of {mockMatch.entryFee} {mockMatch.currency}.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowQuitConfirm(false)}
                  >
                    Keep Playing
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 bg-neon-red hover:bg-neon-red/80"
                    onClick={handleQuit}
                  >
                    Quit Match
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Screen */}
      <AnimatePresence>
        {gameState === 'results' && matchResult && (
          <ResultsScreen
            result={matchResult}
            player={mockPlayer}
            opponent={mockOpponent}
            playerScore={playerScore}
            opponentScore={opponentScore}
            ratingChange={ratingChange}
            prizeWon={prizeWon}
            currency={mockMatch.currency}
            tournamentId={tournamentId || ''}
            onPlayAgain={() => navigate(`/tournaments`)}
            onViewLeaderboard={() => navigate(`/leaderboards`)}
            onHome={() => navigate('/')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Player HUD Component
function PlayerHUD({
  player,
  score,
  isPlayer,
}: {
  player: typeof mockPlayer
  score: number
  isPlayer: boolean
}) {
  return (
    <div className={cn(
      'flex items-center gap-3',
      !isPlayer && 'flex-row-reverse'
    )}>
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gaming-border">
          <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
        </div>
        {/* Tier badge */}
        <div className={cn(
          'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
          'bg-gradient-to-br text-xs font-bold text-white',
          tierColors[player.tier]
        )}>
          {player.tier[0]}
        </div>
      </div>

      {/* Info */}
      <div className={cn(!isPlayer && 'text-right')}>
        <div className="flex items-center gap-2">
          {isPlayer && <span className="text-xs text-neon-cyan font-medium">YOU</span>}
          <span className="font-semibold text-white">{player.username}</span>
          {!isPlayer && <span className="text-xs text-neon-red font-medium">OPP</span>}
        </div>
        <motion.div
          key={score}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={cn(
            'font-mono text-lg font-bold',
            isPlayer ? 'text-neon-cyan' : 'text-white/70'
          )}
        >
          {score.toLocaleString()}
        </motion.div>
      </div>
    </div>
  )
}

// Results Screen Component
function ResultsScreen({
  result,
  player,
  opponent,
  playerScore,
  opponentScore,
  ratingChange,
  prizeWon,
  currency,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tournamentId: _tournamentId,
  onPlayAgain,
  onViewLeaderboard,
  onHome,
}: {
  result: 'win' | 'lose' | 'draw'
  player: typeof mockPlayer
  opponent: typeof mockOpponent
  playerScore: number
  opponentScore: number
  ratingChange: number
  prizeWon: number
  currency: string
  tournamentId: string
  onPlayAgain: () => void
  onViewLeaderboard: () => void
  onHome: () => void
}) {
  const resultConfig = {
    win: {
      title: 'VICTORY!',
      subtitle: 'You dominated the competition!',
      color: 'text-neon-green',
      bgGradient: 'from-neon-green/20 to-transparent',
      icon: Crown,
      iconBg: 'bg-neon-green/20',
    },
    lose: {
      title: 'DEFEAT',
      subtitle: 'Better luck next time!',
      color: 'text-neon-red',
      bgGradient: 'from-neon-red/20 to-transparent',
      icon: Target,
      iconBg: 'bg-neon-red/20',
    },
    draw: {
      title: 'DRAW',
      subtitle: 'An evenly matched battle!',
      color: 'text-neon-cyan',
      bgGradient: 'from-neon-cyan/20 to-transparent',
      icon: Medal,
      iconBg: 'bg-neon-cyan/20',
    },
  }

  const config = resultConfig[result]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gaming-darker/95 backdrop-blur-md flex items-center justify-center z-50"
    >
      <div className={cn(
        'absolute inset-0 bg-gradient-to-b opacity-50',
        config.bgGradient
      )} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="relative max-w-2xl w-full mx-4"
      >
        {/* Result Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4',
              config.iconBg
            )}
          >
            <Icon className={cn('w-12 h-12', config.color)} />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={cn('font-display text-5xl font-bold mb-2', config.color)}
          >
            {config.title}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/50"
          >
            {config.subtitle}
          </motion.p>
        </div>

        {/* Score Comparison */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gaming-dark border border-gaming-border rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            {/* Player */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn(
                  'w-16 h-16 rounded-full overflow-hidden border-4',
                  result === 'win' ? 'border-neon-green' : 'border-gaming-border'
                )}>
                  <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                </div>
                {result === 'win' && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-neon-green flex items-center justify-center">
                    <Crown className="w-4 h-4 text-gaming-dark" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-white/50">You</div>
                <div className="font-semibold text-white">{player.username}</div>
              </div>
            </div>

            {/* Scores */}
            <div className="text-center">
              <div className="flex items-center gap-4">
                <span className={cn(
                  'font-display text-4xl font-bold',
                  result === 'win' ? 'text-neon-green' : 'text-white'
                )}>
                  {playerScore.toLocaleString()}
                </span>
                <span className="text-2xl text-white/30">-</span>
                <span className={cn(
                  'font-display text-4xl font-bold',
                  result === 'lose' ? 'text-neon-red' : 'text-white/70'
                )}>
                  {opponentScore.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Opponent */}
            <div className="flex items-center gap-4 flex-row-reverse">
              <div className="relative">
                <div className={cn(
                  'w-16 h-16 rounded-full overflow-hidden border-4',
                  result === 'lose' ? 'border-neon-green' : 'border-gaming-border'
                )}>
                  <img src={opponent.avatar} alt={opponent.username} className="w-full h-full object-cover" />
                </div>
                {result === 'lose' && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-neon-green flex items-center justify-center">
                    <Crown className="w-4 h-4 text-gaming-dark" />
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-white/50">Opponent</div>
                <div className="font-semibold text-white">{opponent.username}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rewards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {/* Rating Change */}
          <div className="bg-gaming-dark border border-gaming-border rounded-xl p-4 text-center">
            <div className="text-sm text-white/50 mb-2">Rating Change</div>
            <div className="flex items-center justify-center gap-2">
              {ratingChange > 0 ? (
                <TrendingUp className="w-5 h-5 text-neon-green" />
              ) : ratingChange < 0 ? (
                <TrendingDown className="w-5 h-5 text-neon-red" />
              ) : (
                <Minus className="w-5 h-5 text-white/50" />
              )}
              <span className={cn(
                'font-display text-2xl font-bold',
                ratingChange > 0 ? 'text-neon-green' : ratingChange < 0 ? 'text-neon-red' : 'text-white/50'
              )}>
                {ratingChange > 0 ? '+' : ''}{ratingChange}
              </span>
            </div>
            <div className="text-xs text-white/30 mt-1">
              {player.rating} → {player.rating + ratingChange}
            </div>
          </div>

          {/* Prize Won */}
          <div className="bg-gaming-dark border border-gaming-border rounded-xl p-4 text-center">
            <div className="text-sm text-white/50 mb-2">Prize Won</div>
            <div className="flex items-center justify-center gap-2">
              <Trophy className={cn(
                'w-5 h-5',
                prizeWon > 0 ? 'text-neon-green' : 'text-white/30'
              )} />
              <span className={cn(
                'font-display text-2xl font-bold',
                prizeWon > 0 ? 'text-neon-green' : 'text-white/30'
              )}>
                {prizeWon > 0 ? `${prizeWon.toFixed(2)} ${currency}` : '-'}
              </span>
            </div>
            {prizeWon > 0 && (
              <div className="text-xs text-neon-green/70 mt-1">
                Added to wallet
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4"
        >
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onHome}
            leftIcon={<Home className="w-5 h-5" />}
          >
            Home
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onViewLeaderboard}
            leftIcon={<Star className="w-5 h-5" />}
          >
            Leaderboard
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={onPlayAgain}
            leftIcon={<RotateCcw className="w-5 h-5" />}
          >
            Play Again
          </Button>
        </motion.div>

        {/* Share Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <button className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share Result</span>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}