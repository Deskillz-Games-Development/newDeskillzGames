import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Users,
  Clock,
  Zap,
  Crown,
  Medal,
  Award,
  ChevronRight,
  Timer,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
  Share2,
  Bell,
  BellOff,
  Gamepad2,
  TrendingUp
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Tournament status type
type TournamentStatus = 'upcoming' | 'open' | 'in_progress' | 'completed' | 'cancelled'

// Mock tournament data
const mockTournament = {
  id: '1',
  name: 'Speed Racer Championship',
  description: 'Compete against the best racers in this high-stakes tournament. Show your skills and claim the grand prize!',
  game: {
    id: '1',
    name: 'Speed Racer X',
    icon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200&h=400&fit=crop',
    genre: 'Racing',
  },
  entryFee: 5,
  entryCurrency: 'USDT',
  prizePool: 450,
  prizeCurrency: 'USDT',
  maxPlayers: 100,
  currentPlayers: 67,
  minPlayers: 10,
  mode: 'async' as 'sync' | 'async',
  status: 'open' as TournamentStatus,
  startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
  endsAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // 26 hours from now
  registrationEndsAt: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours from now
  matchDuration: 180, // 3 minutes
  serviceFeePercent: 10,
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  rules: [
    'Each player gets one attempt to achieve the highest score',
    'Scores are verified automatically by our anti-cheat system',
    'Any form of cheating will result in disqualification and ban',
    'Players must complete their game before the tournament ends',
    'In case of a tie, the player who submitted first wins',
  ],
  prizeDistribution: [
    { place: 1, percentage: 50, amount: 225 },
    { place: 2, percentage: 25, amount: 112.5 },
    { place: 3, percentage: 15, amount: 67.5 },
    { place: 4, percentage: 5, amount: 22.5 },
    { place: 5, percentage: 5, amount: 22.5 },
  ],
}

// Mock participants
const mockParticipants = [
  { id: '1', username: 'ProGamer_X', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', tier: 'Diamond', rating: 1850, score: 15420, rank: 1 },
  { id: '2', username: 'SkillMaster99', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', tier: 'Platinum', rating: 1720, score: 14890, rank: 2 },
  { id: '3', username: 'SpeedDemon', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', tier: 'Gold', rating: 1580, score: 13750, rank: 3 },
  { id: '4', username: 'NightRacer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', tier: 'Gold', rating: 1520, score: 12980, rank: 4 },
  { id: '5', username: 'TurboKing', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', tier: 'Silver', rating: 1380, score: 11540, rank: 5 },
  { id: '6', username: 'RacerX_', avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100', tier: 'Gold', rating: 1490, score: null, rank: null },
  { id: '7', username: 'FastLane', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', tier: 'Silver', rating: 1350, score: null, rank: null },
  { id: '8', username: 'DriftMaster', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100', tier: 'Bronze', rating: 1200, score: null, rank: null },
]

// Current user (for demo)
const mockCurrentUser = {
  id: '10',
  username: 'You',
  isRegistered: false,
  walletBalance: 25.50,
}

// Tier colors
const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: 'from-orange-600 to-orange-800', text: 'text-orange-400', border: 'border-orange-500/50' },
  Silver: { bg: 'from-gray-400 to-gray-600', text: 'text-gray-300', border: 'border-gray-400/50' },
  Gold: { bg: 'from-yellow-500 to-amber-600', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  Platinum: { bg: 'from-cyan-400 to-blue-500', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  Diamond: { bg: 'from-purple-400 to-pink-500', text: 'text-purple-400', border: 'border-purple-500/50' },
}

// Status config
const statusConfig: Record<TournamentStatus, { label: string; color: string; bgColor: string }> = {
  upcoming: { label: 'Upcoming', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  open: { label: 'Registration Open', color: 'text-neon-green', bgColor: 'bg-neon-green/20' },
  in_progress: { label: 'In Progress', color: 'text-neon-cyan', bgColor: 'bg-neon-cyan/20' },
  completed: { label: 'Completed', color: 'text-white/50', bgColor: 'bg-white/10' },
  cancelled: { label: 'Cancelled', color: 'text-neon-red', bgColor: 'bg-neon-red/20' },
}

export default function TournamentDetailPage() {
  const { tournamentId } = useParams()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'rules'>('overview')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isRegistered, setIsRegistered] = useState(mockCurrentUser.isRegistered)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Calculate countdown
  useEffect(() => {
    const calculateCountdown = () => {
      const target = new Date(mockTournament.startsAt).getTime()
      const now = Date.now()
      const diff = target - now

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  // Handle join tournament
  const handleJoin = async () => {
    setIsJoining(true)
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsJoining(false)
    setIsRegistered(true)
    setShowJoinModal(false)
  }

  // Handle play (if registered and tournament is active)
  const handlePlay = () => {
    navigate(`/tournaments/${tournamentId}/matchmaking`)
  }

  const status = statusConfig[mockTournament.status]
  const spotsLeft = mockTournament.maxPlayers - mockTournament.currentPlayers
  const fillPercentage = (mockTournament.currentPlayers / mockTournament.maxPlayers) * 100

  return (
    <div className="min-h-screen py-8">
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={mockTournament.game.banner}
            alt={mockTournament.game.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gaming-darker via-gaming-darker/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gaming-darker/80 to-transparent" />
        </div>

        {/* Banner Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end gap-6">
              {/* Game Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="hidden md:block"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-gaming-border shadow-2xl">
                  <img
                    src={mockTournament.game.icon}
                    alt={mockTournament.game.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Tournament Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    status.bgColor,
                    status.color
                  )}>
                    {status.label}
                  </span>
                  <span className="text-white/50 text-sm">
                    {mockTournament.game.name} • {mockTournament.game.genre}
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                  {mockTournament.name}
                </h1>
                <p className="text-white/60 max-w-2xl line-clamp-2">
                  {mockTournament.description}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={cn(
                    'p-3 rounded-xl border transition-colors',
                    notificationsEnabled
                      ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                      : 'bg-gaming-light border-gaming-border text-white/50 hover:text-white'
                  )}
                >
                  {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
                <button className="p-3 rounded-xl bg-gaming-light border border-gaming-border text-white/50 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-neon-green" />
                    </div>
                    <div className="font-display text-2xl font-bold text-neon-green">
                      {mockTournament.prizePool} {mockTournament.prizeCurrency}
                    </div>
                    <div className="text-sm text-white/50">Prize Pool</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <div className="font-display text-2xl font-bold text-white">
                      {mockTournament.entryFee} {mockTournament.entryCurrency}
                    </div>
                    <div className="text-sm text-white/50">Entry Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-neon-purple" />
                    </div>
                    <div className="font-display text-2xl font-bold text-white">
                      {mockTournament.currentPlayers}/{mockTournament.maxPlayers}
                    </div>
                    <div className="text-sm text-white/50">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="font-display text-2xl font-bold text-white">
                      {Math.floor(mockTournament.matchDuration / 60)}:{(mockTournament.matchDuration % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-white/50">Match Duration</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex gap-2 border-b border-gaming-border">
                {(['overview', 'participants', 'rules'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-6 py-3 font-medium transition-colors relative',
                      activeTab === tab
                        ? 'text-neon-cyan'
                        : 'text-white/50 hover:text-white'
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan"
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Prize Distribution */}
                  <Card className="p-6">
                    <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-neon-green" />
                      Prize Distribution
                    </h3>
                    <div className="space-y-3">
                      {mockTournament.prizeDistribution.map((prize, index) => (
                        <div
                          key={prize.place}
                          className={cn(
                            'flex items-center gap-4 p-3 rounded-xl',
                            index === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                            index === 1 ? 'bg-gray-400/10 border border-gray-400/30' :
                            index === 2 ? 'bg-orange-600/10 border border-orange-600/30' :
                            'bg-gaming-light'
                          )}
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            index === 0 ? 'bg-yellow-500/20' :
                            index === 1 ? 'bg-gray-400/20' :
                            index === 2 ? 'bg-orange-600/20' :
                            'bg-gaming-darker'
                          )}>
                            {index === 0 ? <Crown className="w-5 h-5 text-yellow-400" /> :
                             index === 1 ? <Medal className="w-5 h-5 text-gray-300" /> :
                             index === 2 ? <Award className="w-5 h-5 text-orange-500" /> :
                             <span className="font-bold text-white/50">{prize.place}</span>}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">
                              {prize.place === 1 ? '1st Place' :
                               prize.place === 2 ? '2nd Place' :
                               prize.place === 3 ? '3rd Place' :
                               `${prize.place}th Place`}
                            </div>
                            <div className="text-sm text-white/50">{prize.percentage}% of prize pool</div>
                          </div>
                          <div className="font-display text-xl font-bold text-neon-green">
                            {prize.amount} {mockTournament.prizeCurrency}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Platform fee note */}
                    <div className="mt-4 p-3 bg-gaming-darker rounded-lg flex items-start gap-3">
                      <Info className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
                      <p className="text-sm text-white/50">
                        A {mockTournament.serviceFeePercent}% platform fee is deducted from the prize pool to maintain 
                        the platform and ensure fair play through our anti-cheat systems.
                      </p>
                    </div>
                  </Card>

                  {/* Tournament Mode */}
                  <Card className="p-6">
                    <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-neon-cyan" />
                      Tournament Mode
                    </h3>
                    <div className={cn(
                      'p-4 rounded-xl border',
                      mockTournament.mode === 'sync' 
                        ? 'bg-neon-purple/10 border-neon-purple/30' 
                        : 'bg-neon-cyan/10 border-neon-cyan/30'
                    )}>
                      <div className="flex items-center gap-3 mb-2">
                        {mockTournament.mode === 'sync' ? (
                          <>
                            <Zap className="w-6 h-6 text-neon-purple" />
                            <span className="font-display text-lg font-semibold text-white">Real-Time (Sync)</span>
                          </>
                        ) : (
                          <>
                            <Timer className="w-6 h-6 text-neon-cyan" />
                            <span className="font-display text-lg font-semibold text-white">Asynchronous</span>
                          </>
                        )}
                      </div>
                      <p className="text-white/60">
                        {mockTournament.mode === 'sync' 
                          ? 'Players compete head-to-head in real-time matches. You\'ll be matched with an opponent of similar skill level.'
                          : 'Play at your own pace before the deadline. Your score will be compared with other players once the tournament ends.'}
                      </p>
                    </div>
                  </Card>

                  {/* Top Performers (if in progress or completed) */}
                  {(mockTournament.status === 'in_progress' || mockTournament.status === 'completed') && (
                    <Card className="p-6">
                      <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-neon-green" />
                        Current Leaderboard
                      </h3>
                      <div className="space-y-2">
                        {mockParticipants.filter(p => p.score !== null).slice(0, 5).map((player, index) => (
                          <div
                            key={player.id}
                            className={cn(
                              'flex items-center gap-4 p-3 rounded-xl',
                              index === 0 ? 'bg-yellow-500/10' : 'bg-gaming-light'
                            )}
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                              index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              index === 1 ? 'bg-gray-400/20 text-gray-300' :
                              index === 2 ? 'bg-orange-600/20 text-orange-500' :
                              'bg-gaming-darker text-white/50'
                            )}>
                              {index + 1}
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-white">{player.username}</div>
                              <div className={cn('text-xs font-medium', tierColors[player.tier].text)}>
                                {player.tier}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-display font-bold text-white">
                                {player.score?.toLocaleString()}
                              </div>
                              <div className="text-xs text-white/50">points</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link
                        to="#"
                        onClick={() => setActiveTab('participants')}
                        className="mt-4 flex items-center justify-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                      >
                        View all participants
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Card>
                  )}
                </motion.div>
              )}

              {activeTab === 'participants' && (
                <motion.div
                  key="participants"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-neon-purple" />
                        Participants ({mockTournament.currentPlayers})
                      </h3>
                      <div className="text-sm text-white/50">
                        {spotsLeft} spots remaining
                      </div>
                    </div>

                    {/* Participant list */}
                    <div className="space-y-2">
                      {mockParticipants.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-4 p-3 rounded-xl bg-gaming-light hover:bg-gaming-light/80 transition-colors"
                        >
                          {/* Rank */}
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                            player.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            player.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                            player.rank === 3 ? 'bg-orange-600/20 text-orange-500' :
                            player.rank ? 'bg-gaming-darker text-white/50' :
                            'bg-gaming-darker text-white/30'
                          )}>
                            {player.rank || '-'}
                          </div>

                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                            </div>
                            <div className={cn(
                              'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br',
                              tierColors[player.tier].bg
                            )}>
                              {player.tier[0]}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="font-medium text-white">{player.username}</div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={tierColors[player.tier].text}>{player.tier}</span>
                              <span className="text-white/30">•</span>
                              <span className="text-white/50">{player.rating} rating</span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            {player.score !== null ? (
                              <>
                                <div className="font-display font-bold text-white">
                                  {player.score.toLocaleString()}
                                </div>
                                <div className="text-xs text-neon-green">Played</div>
                              </>
                            ) : (
                              <>
                                <div className="font-display font-bold text-white/30">-</div>
                                <div className="text-xs text-white/30">Waiting</div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {mockTournament.currentPlayers > mockParticipants.length && (
                      <div className="mt-4 text-center text-white/50">
                        + {mockTournament.currentPlayers - mockParticipants.length} more participants
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {activeTab === 'rules' && (
                <motion.div
                  key="rules"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="p-6">
                    <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-neon-cyan" />
                      Tournament Rules
                    </h3>
                    <div className="space-y-4">
                      {mockTournament.rules.map((rule, index) => (
                        <div key={index} className="flex gap-4 p-4 bg-gaming-light rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center shrink-0">
                            <span className="font-bold text-neon-cyan">{index + 1}</span>
                          </div>
                          <p className="text-white/80 pt-1">{rule}</p>
                        </div>
                      ))}
                    </div>

                    {/* Fair Play Notice */}
                    <div className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-neon-green shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white mb-1">Fair Play Guarantee</h4>
                          <p className="text-sm text-white/60">
                            All games are monitored by our advanced anti-cheat system. Any suspicious activity 
                            will be reviewed, and cheaters will be permanently banned from the platform.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 sticky top-24">
                {/* Countdown */}
                {mockTournament.status === 'open' && (
                  <div className="mb-6">
                    <div className="text-sm text-white/50 mb-3 text-center">Tournament starts in</div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: countdown.days, label: 'Days' },
                        { value: countdown.hours, label: 'Hours' },
                        { value: countdown.minutes, label: 'Mins' },
                        { value: countdown.seconds, label: 'Secs' },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <div className="bg-gaming-darker rounded-lg p-2 mb-1">
                            <span className="font-display text-2xl font-bold text-white">
                              {item.value.toString().padStart(2, '0')}
                            </span>
                          </div>
                          <span className="text-xs text-white/50">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spots Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/50">Spots filled</span>
                    <span className="text-white font-medium">
                      {mockTournament.currentPlayers}/{mockTournament.maxPlayers}
                    </span>
                  </div>
                  <div className="h-3 bg-gaming-darker rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={cn(
                        'h-full rounded-full',
                        fillPercentage >= 90 ? 'bg-neon-red' :
                        fillPercentage >= 70 ? 'bg-yellow-500' :
                        'bg-neon-green'
                      )}
                    />
                  </div>
                  {spotsLeft <= 10 && spotsLeft > 0 && (
                    <p className="text-xs text-neon-red mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Only {spotsLeft} spots left!
                    </p>
                  )}
                </div>

                {/* Action Button */}
                {isRegistered ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-neon-green/10 border border-neon-green/30 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-neon-green" />
                      <span className="text-neon-green font-medium">You're registered!</span>
                    </div>
                    {mockTournament.status === 'in_progress' || mockTournament.status === 'open' ? (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handlePlay}
                        leftIcon={<Gamepad2 className="w-5 h-5" />}
                      >
                        Play Now
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="lg"
                        className="w-full"
                        disabled
                      >
                        Waiting for tournament to start
                      </Button>
                    )}
                  </div>
                ) : mockTournament.status === 'open' ? (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => setShowJoinModal(true)}
                    leftIcon={<Zap className="w-5 h-5" />}
                  >
                    Join Tournament - {mockTournament.entryFee} {mockTournament.entryCurrency}
                  </Button>
                ) : mockTournament.status === 'upcoming' ? (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    disabled
                  >
                    Registration opens soon
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    disabled
                  >
                    Tournament {mockTournament.status === 'completed' ? 'ended' : 'closed'}
                  </Button>
                )}

                {/* Entry Info */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Entry Fee</span>
                    <span className="text-white font-medium">
                      {mockTournament.entryFee} {mockTournament.entryCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Prize Pool</span>
                    <span className="text-neon-green font-medium">
                      {mockTournament.prizePool} {mockTournament.prizeCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Platform Fee</span>
                    <span className="text-white/70">{mockTournament.serviceFeePercent}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Mode</span>
                    <span className="text-white/70 capitalize">{mockTournament.mode}</span>
                  </div>
                </div>

                {/* Share */}
                <div className="mt-6 pt-6 border-t border-gaming-border">
                  <button className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white transition-colors py-2">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share Tournament</span>
                  </button>
                </div>
              </Card>
            </motion.div>

            {/* Game Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold text-white mb-4">Game</h3>
                <Link
                  to={`/games/${mockTournament.game.id}`}
                  className="flex items-center gap-4 p-3 bg-gaming-light rounded-xl hover:bg-gaming-light/80 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden">
                    <img
                      src={mockTournament.game.icon}
                      alt={mockTournament.game.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white group-hover:text-neon-cyan transition-colors">
                      {mockTournament.game.name}
                    </div>
                    <div className="text-sm text-white/50">{mockTournament.game.genre}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-neon-cyan transition-colors" />
                </Link>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isJoining && setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gaming-dark border border-gaming-border rounded-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Join Tournament
              </h2>
              <p className="text-white/50 mb-6">
                Confirm your entry to {mockTournament.name}
              </p>

              {/* Tournament Summary */}
              <div className="bg-gaming-light rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <img
                      src={mockTournament.game.icon}
                      alt={mockTournament.game.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{mockTournament.name}</div>
                    <div className="text-sm text-white/50">{mockTournament.game.name}</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Entry Fee</span>
                    <span className="text-white font-medium">
                      {mockTournament.entryFee} {mockTournament.entryCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Prize Pool</span>
                    <span className="text-neon-green font-medium">
                      {mockTournament.prizePool} {mockTournament.prizeCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Your Balance</span>
                    <span className={cn(
                      'font-medium',
                      mockCurrentUser.walletBalance >= mockTournament.entryFee 
                        ? 'text-white' 
                        : 'text-neon-red'
                    )}>
                      {mockCurrentUser.walletBalance} USDT
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Warning */}
              {mockCurrentUser.walletBalance < mockTournament.entryFee && (
                <div className="mb-6 p-3 bg-neon-red/10 border border-neon-red/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-neon-red shrink-0" />
                  <div className="text-sm text-neon-red">
                    Insufficient balance. You need {mockTournament.entryFee - mockCurrentUser.walletBalance} more USDT to join.
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowJoinModal(false)}
                  disabled={isJoining}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleJoin}
                  disabled={isJoining || mockCurrentUser.walletBalance < mockTournament.entryFee}
                  leftIcon={isJoining ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                >
                  {isJoining ? 'Joining...' : 'Confirm Entry'}
                </Button>
              </div>

              {/* Fine print */}
              <p className="text-xs text-white/30 text-center mt-4">
                By joining, you agree to the tournament rules and platform terms of service.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}