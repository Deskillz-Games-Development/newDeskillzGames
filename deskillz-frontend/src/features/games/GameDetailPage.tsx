import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star,
  Trophy,
  Download,
  Clock,
  Zap,
  Shield,
  ArrowLeft,
  Smartphone,
  Apple,
  Info,
  Target,
  Crown,
  Medal,
  Calendar,
  Play
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'

// Mock game data - would come from API
const mockGame = {
  id: '1',
  name: 'Speed Racer X',
  tagline: 'High-octane racing at your fingertips',
  description: `Speed Racer X is the ultimate mobile racing experience. Race through stunning environments, master challenging tracks, and compete against players worldwide for real USDT prizes.

Features:
• 20+ unique tracks across 5 environments
• Multiple car classes with upgradeable stats
• Real-time multiplayer racing
• Daily and weekly tournaments
• Skill-based matchmaking`,
  genre: 'Racing',
  developer: 'Velocity Games Studio',
  rating: 4.8,
  totalPlayers: 12500,
  activePlayers: 342,
  totalTournaments: 156,
  prizePoolTotal: 125000,
  releaseDate: '2024-06-15',
  version: '2.1.0',
  sdkVersion: '1.4.2',
  platforms: ['android', 'ios'],
  androidUrl: 'https://play.google.com/store/apps/details?id=com.deskillz.speedracerx',
  iosUrl: 'https://apps.apple.com/app/speed-racer-x/id123456789',
  demoEnabled: true,
  bannerImage: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200&h=400&fit=crop',
  iconImage: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=200&h=200&fit=crop',
  screenshots: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=500&fit=crop',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=300&h=500&fit=crop',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=500&fit=crop',
  ],
  howToPlay: [
    'Download the game from Google Play or App Store',
    'Open the app and connect your Deskillz wallet',
    'Browse available tournaments or try Demo Mode for free',
    'To compete, select a tournament and pay the entry fee',
    'Play your best - highest score when tournament ends wins!',
  ],
  rules: [
    'One attempt per tournament entry',
    'Score must be submitted before tournament deadline',
    'Use of cheats or exploits results in disqualification',
    'Minimum 2 players required for tournament to proceed',
    'Prizes distributed within 24 hours of tournament end',
  ],
}

// Mock active tournaments - live data from API
const mockTournaments = [
  {
    id: '1',
    name: 'Weekly Championship',
    description: 'Compete for the biggest prize pool of the week',
    entryFee: 10,
    currentPrizePool: 850, // Dynamic - grows as players join
    players: 85,
    minPlayers: 20,
    maxPlayers: 200,
    mode: 'async',
    registrationEnds: '2024-12-20T23:59:59',
    tournamentEnds: '2024-12-22T23:59:59',
    status: 'registering',
  },
  {
    id: '2',
    name: 'Heads Up Battle',
    description: '1v1 matches - prove your skill',
    entryFee: 5,
    currentPrizePool: 10, // 2 players x $5
    players: 2,
    minPlayers: 2,
    maxPlayers: 2,
    mode: 'sync',
    registrationEnds: '2024-12-18T20:00:00',
    tournamentEnds: '2024-12-18T20:30:00',
    status: 'ready', // Min players met, waiting to start
  },
  {
    id: '3',
    name: 'Beginner Friendly',
    description: 'Low stakes tournament for new players',
    entryFee: 1,
    currentPrizePool: 15,
    players: 15,
    minPlayers: 10,
    maxPlayers: 50,
    mode: 'async',
    registrationEnds: '2024-12-19T23:59:59',
    tournamentEnds: '2024-12-21T23:59:59',
    status: 'registering',
  },
  {
    id: '4',
    name: 'Pro League Qualifier',
    description: 'High stakes competition for serious players',
    entryFee: 25,
    currentPrizePool: 125,
    players: 5,
    minPlayers: 16,
    maxPlayers: 32,
    mode: 'async',
    registrationEnds: '2024-12-25T23:59:59',
    tournamentEnds: '2024-12-27T23:59:59',
    status: 'registering',
  },
  {
    id: '5',
    name: 'Daily Heads Up #42',
    description: 'Quick 1v1 match',
    entryFee: 2,
    currentPrizePool: 0,
    players: 1,
    minPlayers: 2,
    maxPlayers: 2,
    mode: 'sync',
    registrationEnds: '2024-12-18T18:00:00',
    tournamentEnds: '2024-12-18T18:30:00',
    status: 'waiting', // Waiting for opponent
  },
]

// Mock leaderboard
const mockLeaderboard = [
  { rank: 1, username: 'SpeedDemon', score: 98500, prize: 250 },
  { rank: 2, username: 'RacerX_Pro', score: 95200, prize: 150 },
  { rank: 3, username: 'NitroKing', score: 92800, prize: 75 },
  { rank: 4, username: 'DriftMaster', score: 89400, prize: 0 },
  { rank: 5, username: 'TurboChamp', score: 87100, prize: 0 },
]

type TabType = 'overview' | 'tournaments' | 'leaderboard' | 'howtoplay'

export default function GameDetailPage() {
  const { id: _id } = useParams()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const game = mockGame // Would fetch based on _id

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
    { id: 'howtoplay', label: 'How to Play', icon: Target },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src={game.bannerImage}
          alt={game.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark via-gaming-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gaming-dark/80 via-transparent to-transparent" />
        
        {/* Back button */}
        <Link 
          to="/games"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-gaming-dark/50 backdrop-blur-sm border border-gaming-border/50 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Games</span>
        </Link>
      </div>

      {/* Game Info Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-6 items-start"
        >
          {/* Game Icon */}
          <div className="relative">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-gaming-dark shadow-xl">
              <img
                src={game.iconImage}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            </div>
            {game.demoEnabled && (
              <Badge variant="success" size="sm" className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                Demo Available
              </Badge>
            )}
          </div>

          {/* Game Details */}
          <div className="flex-1 pt-2 sm:pt-8">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge variant="info" size="md">{game.genre}</Badge>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="font-semibold">{game.rating}</span>
              </div>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
              {game.name}
            </h1>
            <p className="text-white/60 mb-4">{game.tagline}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            {game.platforms.includes('android') && (
              <a href={game.androidUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Smartphone className="w-5 h-5" />}
                  className="w-full"
                >
                  Get on Android
                </Button>
              </a>
            )}
            {game.platforms.includes('ios') && (
              <a href={game.iosUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Apple className="w-5 h-5" />}
                  className="w-full"
                >
                  Get on iOS
                </Button>
              </a>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gaming-border">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 font-display text-sm uppercase tracking-wider whitespace-nowrap',
                  'border-b-2 transition-all duration-200',
                  activeTab === tab.id
                    ? 'text-neon-cyan border-neon-cyan'
                    : 'text-white/50 border-transparent hover:text-white/70'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Description */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-display text-lg font-semibold text-white mb-4">About This Game</h3>
                      <p className="text-white/60 whitespace-pre-line leading-relaxed">
                        {game.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Screenshots */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-display text-lg font-semibold text-white mb-4">Screenshots</h3>
                      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {game.screenshots.map((screenshot, index) => (
                          <div
                            key={index}
                            className="flex-shrink-0 w-40 h-72 rounded-xl overflow-hidden border border-gaming-border hover:border-neon-cyan/50 transition-colors"
                          >
                            <img
                              src={screenshot}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Download Card */}
                  <Card variant="glow">
                    <CardContent className="p-6">
                      <h3 className="font-display text-lg font-semibold text-white mb-4">Download Game</h3>
                      <div className="space-y-3">
                        {game.platforms.includes('android') && (
                          <a
                            href={game.androidUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gaming-darker border border-gaming-border hover:border-neon-green/50 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-neon-green" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-white/50">Download on</p>
                              <p className="font-semibold text-white group-hover:text-neon-green transition-colors">Google Play</p>
                            </div>
                            <Download className="w-5 h-5 text-white/30 group-hover:text-neon-green transition-colors" />
                          </a>
                        )}
                        {game.platforms.includes('ios') && (
                          <a
                            href={game.iosUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gaming-darker border border-gaming-border hover:border-white/50 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                              <Apple className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-white/50">Download on</p>
                              <p className="font-semibold text-white">App Store</p>
                            </div>
                            <Download className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Game Info Card */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-display text-lg font-semibold text-white mb-4">Game Info</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/50">Developer</span>
                          <span className="text-white">{game.developer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Version</span>
                          <span className="text-white">{game.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">SDK Version</span>
                          <span className="text-white">{game.sdkVersion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Released</span>
                          <span className="text-white">{new Date(game.releaseDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'tournaments' && (
              <motion.div
                key="tournaments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Info banner */}
                <div className="mb-6 p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white/70">
                        <span className="text-neon-cyan font-semibold">Join tournaments in the app.</span> Download {game.name}, connect your wallet, and enter any tournament below. Prize pools grow as more players join!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-semibold text-white">
                    Active Tournaments
                  </h3>
                  <Badge variant="info" size="sm">
                    {mockTournaments.length} Open
                  </Badge>
                </div>

                <div className="space-y-4">
                  {mockTournaments.map((tournament, index) => {
                    const minPlayersMet = tournament.players >= tournament.minPlayers
                    const isFull = tournament.players >= tournament.maxPlayers
                    const isHeadsUp = tournament.maxPlayers === 2
                    const fillPercentage = (tournament.players / tournament.maxPlayers) * 100
                    const minThresholdPercentage = (tournament.minPlayers / tournament.maxPlayers) * 100
                    
                    // Format dates
                    const regEndDate = new Date(tournament.registrationEnds)
                    const tourneyEndDate = new Date(tournament.tournamentEnds)
                    const now = new Date()
                    const daysUntilRegEnds = Math.ceil((regEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <motion.div
                        key={tournament.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card hover={false} className="overflow-hidden">
                          <div className="p-4 sm:p-6">
                            {/* Header row */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  'w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0',
                                  tournament.mode === 'sync' 
                                    ? 'bg-neon-cyan/10 border-neon-cyan/30' 
                                    : 'bg-neon-purple/10 border-neon-purple/30'
                                )}>
                                  {tournament.mode === 'sync' ? (
                                    <Zap className="w-6 h-6 text-neon-cyan" />
                                  ) : (
                                    <Clock className="w-6 h-6 text-neon-purple" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-display font-semibold text-white">{tournament.name}</h4>
                                    {isHeadsUp && (
                                      <Badge variant="default" size="sm">1v1</Badge>
                                    )}
                                    {tournament.status === 'waiting' && (
                                      <Badge variant="warning" size="sm" pulse>Waiting for Opponent</Badge>
                                    )}
                                    {tournament.status === 'ready' && (
                                      <Badge variant="success" size="sm" pulse>Ready to Start</Badge>
                                    )}
                                    {isFull && (
                                      <Badge variant="danger" size="sm">Full</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-white/50">{tournament.description}</p>
                                </div>
                              </div>
                              
                              {/* Entry fee badge */}
                              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gaming-darker border border-gaming-border">
                                <span className="text-white/50 text-sm">Entry:</span>
                                <span className="font-display font-bold text-white">{formatCurrency(tournament.entryFee)}</span>
                              </div>
                            </div>
                            
                            {/* Stats grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                              {/* Prize Pool - Dynamic */}
                              <div className="p-3 rounded-lg bg-gaming-darker border border-neon-green/20">
                                <div className="flex items-center gap-2 mb-1">
                                  <Trophy className="w-4 h-4 text-neon-green" />
                                  <span className="text-xs text-white/50">Prize Pool</span>
                                </div>
                                <div className="font-display font-bold text-xl text-neon-green">
                                  {formatCurrency(tournament.currentPrizePool)}
                                </div>
                                <p className="text-xs text-white/30">+{formatCurrency(tournament.entryFee)} per player</p>
                              </div>
                              
                              {/* Players */}
                              <div className="p-3 rounded-lg bg-gaming-darker border border-gaming-border">
                                <div className="flex items-center gap-2 mb-1">
                                  <Target className="w-4 h-4 text-neon-cyan" />
                                  <span className="text-xs text-white/50">Players</span>
                                </div>
                                <div className="font-display font-bold text-xl text-white">
                                  {tournament.players}<span className="text-white/30">/{tournament.maxPlayers}</span>
                                </div>
                                <p className="text-xs text-white/30">Min {tournament.minPlayers} to start</p>
                              </div>
                              
                              {/* Registration Ends */}
                              <div className="p-3 rounded-lg bg-gaming-darker border border-gaming-border">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-neon-purple" />
                                  <span className="text-xs text-white/50">Registration Ends</span>
                                </div>
                                <div className="font-display font-bold text-lg text-white">
                                  {daysUntilRegEnds > 0 ? `${daysUntilRegEnds}d left` : 'Today'}
                                </div>
                                <p className="text-xs text-white/30">{regEndDate.toLocaleDateString()}</p>
                              </div>
                              
                              {/* Tournament Ends */}
                              <div className="p-3 rounded-lg bg-gaming-darker border border-gaming-border">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-white/50" />
                                  <span className="text-xs text-white/50">Tournament Ends</span>
                                </div>
                                <div className="font-display font-bold text-lg text-white">
                                  {tourneyEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <p className="text-xs text-white/30">{tourneyEndDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                            
                            {/* Player fill progress bar */}
                            <div className="relative">
                              <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                                <span>Player Capacity</span>
                                <span className={minPlayersMet ? 'text-neon-green' : 'text-white/50'}>
                                  {minPlayersMet ? '✓ Minimum met' : `${tournament.minPlayers - tournament.players} more needed`}
                                </span>
                              </div>
                              <div className="h-2 bg-gaming-darker rounded-full overflow-hidden relative">
                                {/* Min threshold marker */}
                                {!isHeadsUp && (
                                  <div 
                                    className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
                                    style={{ left: `${minThresholdPercentage}%` }}
                                  />
                                )}
                                {/* Fill bar */}
                                <div 
                                  className={cn(
                                    'h-full transition-all duration-500',
                                    minPlayersMet 
                                      ? 'bg-gradient-to-r from-neon-green to-emerald-500'
                                      : 'bg-gradient-to-r from-neon-cyan to-primary-500'
                                  )}
                                  style={{ width: `${fillPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
                
                {/* Bottom note */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-white/40">
                    Download the app to join tournaments. All entry fees and prizes are in USDT.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-semibold text-white">
                    Top Players This Week
                  </h3>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-sm rounded-lg bg-neon-cyan text-gaming-dark font-semibold">
                      Weekly
                    </button>
                    <button className="px-3 py-1 text-sm rounded-lg text-white/50 hover:text-white transition-colors">
                      All Time
                    </button>
                  </div>
                </div>

                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gaming-border">
                          <th className="text-left py-4 px-6 text-xs font-display uppercase tracking-wider text-white/50">Rank</th>
                          <th className="text-left py-4 px-6 text-xs font-display uppercase tracking-wider text-white/50">Player</th>
                          <th className="text-right py-4 px-6 text-xs font-display uppercase tracking-wider text-white/50">Best Score</th>
                          <th className="text-right py-4 px-6 text-xs font-display uppercase tracking-wider text-white/50">Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockLeaderboard.map((player) => (
                          <tr 
                            key={player.rank}
                            className="border-b border-gaming-border/50 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                {player.rank === 1 && <Crown className="w-5 h-5 text-yellow-400" />}
                                {player.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                                {player.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                                {player.rank > 3 && <span className="w-5 text-center text-white/50">#{player.rank}</span>}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold text-white">
                                  {player.username.charAt(0)}
                                </div>
                                <span className="font-semibold text-white">{player.username}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right font-mono text-white">
                              {formatNumber(player.score)}
                            </td>
                            <td className="py-4 px-6 text-right">
                              {player.prize > 0 ? (
                                <span className="text-neon-green font-semibold">{formatCurrency(player.prize)}</span>
                              ) : (
                                <span className="text-white/30">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'howtoplay' && (
              <motion.div
                key="howtoplay"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* How to Play */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <Play className="w-5 h-5 text-neon-cyan" />
                      How to Play
                    </h3>
                    <ol className="space-y-4">
                      {game.howToPlay.map((step, index) => (
                        <li key={index} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center flex-shrink-0">
                            <span className="font-display font-bold text-neon-cyan text-sm">{index + 1}</span>
                          </div>
                          <p className="text-white/70 pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                {/* Rules */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-neon-purple" />
                      Tournament Rules
                    </h3>
                    <ul className="space-y-3">
                      {game.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-neon-purple mt-2 flex-shrink-0" />
                          <p className="text-white/70">{rule}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Game Modes Explanation */}
                <Card className="lg:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold text-white mb-6">Game Modes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-gaming-darker border border-gaming-border">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                            <Target className="w-5 h-5 text-neon-green" />
                          </div>
                          <div>
                            <h4 className="font-display font-semibold text-white">Demo Mode</h4>
                            <p className="text-xs text-white/50">Practice for free</p>
                          </div>
                        </div>
                        <p className="text-sm text-white/60">
                          Play unlimited practice games without entry fees. Perfect for learning the game and improving your skills before competing in tournaments.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gaming-darker border border-gaming-border">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-neon-cyan" />
                          </div>
                          <div>
                            <h4 className="font-display font-semibold text-white">Tournament Mode</h4>
                            <p className="text-xs text-white/50">Compete for prizes</p>
                          </div>
                        </div>
                        <p className="text-sm text-white/60">
                          Pay an entry fee and compete against other players. The highest score wins the prize pool. Entry fees and prizes are in USDT.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}