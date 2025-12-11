import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  Target,
  ChevronDown,
  Search
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

// Time period options
const timePeriods = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'alltime', label: 'All Time' },
]

// Games for filtering
const games = [
  { id: 'all', name: 'All Games', icon: null },
  { id: '1', name: 'Speed Racer X', icon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop' },
  { id: '2', name: 'Puzzle Master', icon: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=100&h=100&fit=crop' },
  { id: '3', name: 'Battle Cards', icon: 'https://images.unsplash.com/photo-1529480780361-4e1b499781e4?w=100&h=100&fit=crop' },
  { id: '4', name: 'Word Champion', icon: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=100&h=100&fit=crop' },
]

// Mock leaderboard data
const mockGlobalLeaderboard = [
  {
    rank: 1,
    previousRank: 1,
    username: 'xXProGamerXx',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    earnings: 12450.00,
    wins: 156,
    winRate: 68.5,
    tournaments: 228,
    favoriteGame: 'Speed Racer X',
    tier: 'Diamond',
  },
  {
    rank: 2,
    previousRank: 3,
    username: 'SkillMaster99',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    earnings: 9820.00,
    wins: 134,
    winRate: 62.1,
    tournaments: 216,
    favoriteGame: 'Puzzle Master',
    tier: 'Diamond',
  },
  {
    rank: 3,
    previousRank: 2,
    username: 'CryptoChamp',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    earnings: 8540.00,
    wins: 98,
    winRate: 55.8,
    tournaments: 176,
    favoriteGame: 'Battle Cards',
    tier: 'Platinum',
  },
  {
    rank: 4,
    previousRank: 4,
    username: 'NinjaPlayer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    earnings: 7290.00,
    wins: 89,
    winRate: 51.2,
    tournaments: 174,
    favoriteGame: 'Speed Racer X',
    tier: 'Platinum',
  },
  {
    rank: 5,
    previousRank: 7,
    username: 'GameWizard',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    earnings: 6150.00,
    wins: 76,
    winRate: 48.7,
    tournaments: 156,
    favoriteGame: 'Word Champion',
    tier: 'Gold',
  },
  {
    rank: 6,
    previousRank: 5,
    username: 'TourneyKing',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    earnings: 5820.00,
    wins: 71,
    winRate: 46.4,
    tournaments: 153,
    favoriteGame: 'Puzzle Master',
    tier: 'Gold',
  },
  {
    rank: 7,
    previousRank: 8,
    username: 'VictoryVault',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop',
    earnings: 4980.00,
    wins: 64,
    winRate: 44.1,
    tournaments: 145,
    favoriteGame: 'Battle Cards',
    tier: 'Gold',
  },
  {
    rank: 8,
    previousRank: 6,
    username: 'EliteGamer',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
    earnings: 4650.00,
    wins: 58,
    winRate: 42.3,
    tournaments: 137,
    favoriteGame: 'Speed Racer X',
    tier: 'Gold',
  },
  {
    rank: 9,
    previousRank: 9,
    username: 'ProPlayer_X',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    earnings: 4120.00,
    wins: 52,
    winRate: 40.6,
    tournaments: 128,
    favoriteGame: 'Word Champion',
    tier: 'Silver',
  },
  {
    rank: 10,
    previousRank: 12,
    username: 'ChampionRise',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    earnings: 3890.00,
    wins: 48,
    winRate: 38.4,
    tournaments: 125,
    favoriteGame: 'Puzzle Master',
    tier: 'Silver',
  },
]

// Mock game-specific leaderboard
const mockGameLeaderboard = [
  {
    rank: 1,
    previousRank: 1,
    username: 'SpeedDemon',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    highScore: 15680,
    earnings: 3450.00,
    wins: 45,
    tournaments: 62,
  },
  {
    rank: 2,
    previousRank: 2,
    username: 'RacerPro',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    highScore: 15420,
    earnings: 2890.00,
    wins: 38,
    tournaments: 55,
  },
  {
    rank: 3,
    previousRank: 4,
    username: 'FastFingers',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    highScore: 14980,
    earnings: 2340.00,
    wins: 32,
    tournaments: 48,
  },
  {
    rank: 4,
    previousRank: 3,
    username: 'NitroKing',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    highScore: 14750,
    earnings: 2120.00,
    wins: 28,
    tournaments: 45,
  },
  {
    rank: 5,
    previousRank: 5,
    username: 'TurboMaster',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    highScore: 14320,
    earnings: 1890.00,
    wins: 24,
    tournaments: 42,
  },
]

// Tier colors
const tierColors: Record<string, string> = {
  Diamond: 'from-cyan-400 to-blue-500',
  Platinum: 'from-gray-300 to-gray-500',
  Gold: 'from-yellow-400 to-amber-500',
  Silver: 'from-gray-400 to-gray-600',
  Bronze: 'from-orange-400 to-orange-600',
}

export default function LeaderboardsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly')
  const [selectedGame, setSelectedGame] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const isGlobalView = selectedGame === 'all'
  const leaderboardData = isGlobalView ? mockGlobalLeaderboard : mockGameLeaderboard
  const selectedGameData = games.find(g => g.id === selectedGame)

  // Filter by search
  const filteredData = leaderboardData.filter(player =>
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Leaderboards
          </h1>
          <p className="text-white/50">
            See who's dominating the competition. Climb the ranks and earn your place among the best.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-cyan/10">
                <Users className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-white">8,542</div>
                <div className="text-xs text-white/50">Active Players</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-green/10">
                <DollarSign className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-neon-green">$125K</div>
                <div className="text-xs text-white/50">Total Prizes Paid</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-purple/10">
                <Trophy className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-white">2,456</div>
                <div className="text-xs text-white/50">Tournaments Completed</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-white">52.3%</div>
                <div className="text-xs text-white/50">Avg Win Rate</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Time period tabs */}
            <div className="flex gap-1 p-1 bg-gaming-light rounded-xl overflow-x-auto">
              {timePeriods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
                    selectedPeriod === period.id
                      ? 'bg-neon-cyan text-gaming-dark'
                      : 'text-white/50 hover:text-white hover:bg-gaming-darker'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Game filter */}
            <div className="relative flex-1 lg:max-w-xs">
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 bg-gaming-light border border-gaming-border rounded-xl text-white focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
              >
                {games.map((game) => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gaming-light border border-gaming-border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Game Header (when specific game selected) */}
        {!isGlobalView && selectedGameData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4">
              <div className="flex items-center gap-4">
                {selectedGameData.icon && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden">
                    <img src={selectedGameData.icon} alt={selectedGameData.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold text-white">{selectedGameData.name}</h2>
                  <p className="text-sm text-white/50">Top players for this game</p>
                </div>
                <Link to={`/games/${selectedGame}`}>
                  <button className="px-4 py-2 rounded-lg bg-gaming-darker text-white/70 hover:text-white hover:bg-gaming-light transition-colors text-sm">
                    View Game
                  </button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 gap-4">
            {/* 2nd Place */}
            <div className="order-1 pt-8">
              {filteredData[1] && (
                <PodiumCard player={filteredData[1]} rank={2} isGlobal={isGlobalView} />
              )}
            </div>
            {/* 1st Place */}
            <div className="order-2">
              {filteredData[0] && (
                <PodiumCard player={filteredData[0]} rank={1} isGlobal={isGlobalView} />
              )}
            </div>
            {/* 3rd Place */}
            <div className="order-3 pt-12">
              {filteredData[2] && (
                <PodiumCard player={filteredData[2]} rank={3} isGlobal={isGlobalView} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-gaming-border">
              <h2 className="font-display text-lg font-semibold text-white">
                {isGlobalView ? 'Global Rankings' : `${selectedGameData?.name} Rankings`}
              </h2>
            </div>

            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-gaming-darker text-xs text-white/50 uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Player</div>
              {isGlobalView ? (
                <>
                  <div className="col-span-2 text-right">Earnings</div>
                  <div className="col-span-1 text-right">Wins</div>
                  <div className="col-span-2 text-right">Win Rate</div>
                  <div className="col-span-2 text-right">Tournaments</div>
                </>
              ) : (
                <>
                  <div className="col-span-2 text-right">High Score</div>
                  <div className="col-span-2 text-right">Earnings</div>
                  <div className="col-span-1 text-right">Wins</div>
                  <div className="col-span-2 text-right">Tournaments</div>
                </>
              )}
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gaming-border">
              {filteredData.slice(3).map((player) => (
                <LeaderboardRow
                  key={player.username}
                  player={player}
                  isGlobal={isGlobalView}
                />
              ))}
            </div>

            {filteredData.length === 0 && (
              <div className="p-8 text-center text-white/50">
                No players found matching your search.
              </div>
            )}
          </Card>
        </motion.div>

        {/* Your Rank Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-4 border-neon-cyan/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold">
                  ?
                </div>
                <div>
                  <div className="font-semibold text-white">Your Rank</div>
                  <div className="text-sm text-white/50">Connect wallet to see your position</div>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-colors text-sm font-medium">
                Connect Wallet
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function PodiumCard({ player, rank, isGlobal }: { player: any; rank: number; isGlobal: boolean }) {
  const rankIcons = {
    1: <Crown className="w-6 h-6" />,
    2: <Medal className="w-6 h-6" />,
    3: <Medal className="w-6 h-6" />,
  }
  
  const rankColors = {
    1: 'from-yellow-400 to-amber-500 text-yellow-400',
    2: 'from-gray-300 to-gray-400 text-gray-300',
    3: 'from-orange-400 to-orange-500 text-orange-400',
  }

  const borderColors = {
    1: 'border-yellow-400/50',
    2: 'border-gray-400/50',
    3: 'border-orange-400/50',
  }

  return (
    <Card className={cn('p-4 text-center', borderColors[rank as keyof typeof borderColors])}>
      {/* Rank badge */}
      <div className={cn(
        'w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br flex items-center justify-center',
        rankColors[rank as keyof typeof rankColors]
      )}>
        {rankIcons[rank as keyof typeof rankIcons]}
      </div>

      {/* Avatar */}
      <div className="relative w-16 h-16 mx-auto mb-3">
        <div className={cn(
          'w-full h-full rounded-full overflow-hidden border-2',
          borderColors[rank as keyof typeof borderColors]
        )}>
          <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
        </div>
        {isGlobal && player.tier && (
          <div className={cn(
            'absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r text-white',
            tierColors[player.tier]
          )}>
            {player.tier}
          </div>
        )}
      </div>

      {/* Username */}
      <div className="font-display font-semibold text-white mb-2 truncate">
        {player.username}
      </div>

      {/* Stats */}
      <div className="space-y-1 text-sm">
        <div className="text-neon-green font-semibold">
          ${player.earnings.toLocaleString()}
        </div>
        <div className="text-white/50">
          {player.wins} wins
        </div>
        {!isGlobal && player.highScore && (
          <div className="text-neon-cyan font-mono">
            {player.highScore.toLocaleString()} pts
          </div>
        )}
      </div>
    </Card>
  )
}

function LeaderboardRow({ player, isGlobal }: { player: any; isGlobal: boolean }) {
  const rankChange = player.previousRank - player.rank
  
  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-gaming-darker/50 transition-colors">
      {/* Rank */}
      <div className="col-span-1 flex items-center gap-2">
        <span className="font-display font-bold text-white">{player.rank}</span>
        {rankChange > 0 && (
          <TrendingUp className="w-4 h-4 text-neon-green" />
        )}
        {rankChange < 0 && (
          <TrendingDown className="w-4 h-4 text-red-400" />
        )}
        {rankChange === 0 && (
          <Minus className="w-4 h-4 text-white/30" />
        )}
      </div>

      {/* Player */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-white truncate">{player.username}</div>
          {isGlobal && player.tier && (
            <div className={cn(
              'inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r text-white',
              tierColors[player.tier]
            )}>
              {player.tier}
            </div>
          )}
        </div>
      </div>

      {isGlobal ? (
        <>
          {/* Earnings */}
          <div className="col-span-2 text-right">
            <span className="font-display font-semibold text-neon-green">
              ${player.earnings.toLocaleString()}
            </span>
          </div>

          {/* Wins */}
          <div className="col-span-1 text-right text-white">
            {player.wins}
          </div>

          {/* Win Rate */}
          <div className="col-span-2 text-right">
            <span className={cn(
              'font-semibold',
              player.winRate >= 50 ? 'text-neon-green' : 'text-white'
            )}>
              {player.winRate}%
            </span>
          </div>

          {/* Tournaments */}
          <div className="col-span-2 text-right text-white/70">
            {player.tournaments}
          </div>
        </>
      ) : (
        <>
          {/* High Score */}
          <div className="col-span-2 text-right">
            <span className="font-mono text-neon-cyan">
              {player.highScore?.toLocaleString()}
            </span>
          </div>

          {/* Earnings */}
          <div className="col-span-2 text-right">
            <span className="font-display font-semibold text-neon-green">
              ${player.earnings.toLocaleString()}
            </span>
          </div>

          {/* Wins */}
          <div className="col-span-1 text-right text-white">
            {player.wins}
          </div>

          {/* Tournaments */}
          <div className="col-span-2 text-right text-white/70">
            {player.tournaments}
          </div>
        </>
      )}
    </div>
  )
}