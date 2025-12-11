import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Clock,
  Zap,
  Search,
  X,
  Calendar,
  Target,
  Gamepad2,
  ChevronDown,
  SlidersHorizontal,
  Smartphone,
  Apple
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, cn } from '@/lib/utils'

// Mock games for filter
const games = [
  { id: 'all', name: 'All Games' },
  { id: '1', name: 'Speed Racer X' },
  { id: '2', name: 'Puzzle Master' },
  { id: '3', name: 'Battle Cards' },
  { id: '4', name: 'Word Champion' },
]

// Entry fee ranges
const entryFeeRanges = [
  { id: 'all', label: 'Any Entry Fee', min: 0, max: Infinity },
  { id: 'free', label: 'Free', min: 0, max: 0 },
  { id: 'low', label: '$1 - $5', min: 1, max: 5 },
  { id: 'mid', label: '$5 - $25', min: 5, max: 25 },
  { id: 'high', label: '$25+', min: 25, max: Infinity },
]

// Tournament modes
const modes = [
  { id: 'all', label: 'All Modes' },
  { id: 'sync', label: 'Real-time (1v1)' },
  { id: 'async', label: 'Async' },
]

// Tournament statuses
const statuses = [
  { id: 'all', label: 'All Status' },
  { id: 'registering', label: 'Open' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'ready', label: 'Ready' },
  { id: 'live', label: 'Live' },
]

// Platforms
const platforms = [
  { id: 'all', label: 'All Platforms' },
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iOS' },
]

// Mock tournaments data
const mockTournaments = [
  {
    id: '1',
    gameId: '1',
    gameName: 'Speed Racer X',
    gameIcon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    platforms: ['android', 'ios'],
    name: 'Weekly Championship',
    description: 'The biggest weekly tournament',
    entryFee: 10,
    currentPrizePool: 850,
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
    gameId: '1',
    gameName: 'Speed Racer X',
    gameIcon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    platforms: ['android', 'ios'],
    name: 'Heads Up Battle',
    description: '1v1 real-time match - opponent waiting!',
    entryFee: 5,
    currentPrizePool: 5,
    players: 1,
    minPlayers: 2,
    maxPlayers: 2,
    mode: 'sync',
    registrationEnds: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    tournamentEnds: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'waiting',
  },
  {
    id: '3',
    gameId: '2',
    gameName: 'Puzzle Master',
    gameIcon: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=100&h=100&fit=crop',
    platforms: ['android'],
    name: 'Brain Buster Tournament',
    description: 'Almost at capacity!',
    entryFee: 2,
    currentPrizePool: 194,
    players: 97,
    minPlayers: 10,
    maxPlayers: 100,
    mode: 'async',
    registrationEnds: '2024-12-21T23:59:59',
    tournamentEnds: '2024-12-23T23:59:59',
    status: 'registering',
  },
  {
    id: '4',
    gameId: '3',
    gameName: 'Battle Cards',
    gameIcon: 'https://images.unsplash.com/photo-1529480780361-4e1b499781e4?w=100&h=100&fit=crop',
    platforms: ['android', 'ios'],
    name: 'Card Masters League',
    description: 'Strategic card battles',
    entryFee: 15,
    currentPrizePool: 225,
    players: 15,
    minPlayers: 16,
    maxPlayers: 64,
    mode: 'async',
    registrationEnds: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // Tomorrow
    tournamentEnds: '2024-12-21T23:59:59',
    status: 'registering',
  },
  {
    id: '5',
    gameId: '1',
    gameName: 'Speed Racer X',
    gameIcon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    platforms: ['android', 'ios'],
    name: 'Quick Race #127',
    description: 'Need 1 more player!',
    entryFee: 2,
    currentPrizePool: 2,
    players: 1,
    minPlayers: 2,
    maxPlayers: 2,
    mode: 'sync',
    registrationEnds: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
    tournamentEnds: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'waiting',
  },
  {
    id: '6',
    gameId: '4',
    gameName: 'Word Champion',
    gameIcon: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=100&h=100&fit=crop',
    platforms: ['ios'],
    name: 'Vocabulary Showdown',
    description: 'Registration closing soon!',
    entryFee: 1,
    currentPrizePool: 67,
    players: 67,
    minPlayers: 20,
    maxPlayers: 150,
    mode: 'async',
    registrationEnds: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // Today
    tournamentEnds: '2024-12-24T23:59:59',
    status: 'registering',
  },
  {
    id: '7',
    gameId: '2',
    gameName: 'Puzzle Master',
    gameIcon: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=100&h=100&fit=crop',
    platforms: ['android'],
    name: 'Speed Solve Challenge',
    description: 'Tournament in progress',
    entryFee: 5,
    currentPrizePool: 250,
    players: 50,
    minPlayers: 10,
    maxPlayers: 50,
    mode: 'async',
    registrationEnds: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Closed
    tournamentEnds: '2024-12-19T23:59:59',
    status: 'live',
  },
  {
    id: '8',
    gameId: '3',
    gameName: 'Battle Cards',
    gameIcon: 'https://images.unsplash.com/photo-1529480780361-4e1b499781e4?w=100&h=100&fit=crop',
    platforms: ['android', 'ios'],
    name: '1v1 Championship Duel',
    description: 'High stakes 1v1!',
    entryFee: 25,
    currentPrizePool: 50,
    players: 2,
    minPlayers: 2,
    maxPlayers: 2,
    mode: 'sync',
    registrationEnds: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Closed
    tournamentEnds: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: 'live',
  },
  {
    id: '9',
    gameId: '1',
    gameName: 'Speed Racer X',
    gameIcon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    platforms: ['android', 'ios'],
    name: 'Pro League Finals',
    description: 'High stakes - 2 more to start!',
    entryFee: 50,
    currentPrizePool: 700,
    players: 14,
    minPlayers: 16,
    maxPlayers: 32,
    mode: 'async',
    registrationEnds: '2024-12-25T23:59:59',
    tournamentEnds: '2024-12-27T23:59:59',
    status: 'registering',
  },
  {
    id: '10',
    gameId: '4',
    gameName: 'Word Champion',
    gameIcon: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=100&h=100&fit=crop',
    platforms: ['ios'],
    name: 'Daily Word Battle',
    description: 'Join before it fills up!',
    entryFee: 1,
    currentPrizePool: 48,
    players: 48,
    minPlayers: 10,
    maxPlayers: 50,
    mode: 'async',
    registrationEnds: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Today
    tournamentEnds: '2024-12-19T12:00:00',
    status: 'registering',
  },
]

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState('all')
  const [selectedFeeRange, setSelectedFeeRange] = useState('all')
  const [selectedMode, setSelectedMode] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
    return mockTournaments.filter((tournament) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          tournament.name.toLowerCase().includes(query) ||
          tournament.gameName.toLowerCase().includes(query) ||
          tournament.description.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Game filter
      if (selectedGame !== 'all' && tournament.gameId !== selectedGame) {
        return false
      }

      // Entry fee filter
      if (selectedFeeRange !== 'all') {
        const range = entryFeeRanges.find(r => r.id === selectedFeeRange)
        if (range && (tournament.entryFee < range.min || tournament.entryFee > range.max)) {
          return false
        }
      }

      // Mode filter
      if (selectedMode !== 'all' && tournament.mode !== selectedMode) {
        return false
      }

      // Status filter
      if (selectedStatus !== 'all' && tournament.status !== selectedStatus) {
        return false
      }

      // Platform filter
      if (selectedPlatform !== 'all' && !tournament.platforms.includes(selectedPlatform)) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedGame, selectedFeeRange, selectedMode, selectedStatus, selectedPlatform])

  // Count active filters
  const activeFilterCount = [
    selectedGame !== 'all',
    selectedFeeRange !== 'all',
    selectedMode !== 'all',
    selectedStatus !== 'all',
    selectedPlatform !== 'all',
  ].filter(Boolean).length

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGame('all')
    setSelectedFeeRange('all')
    setSelectedMode('all')
    setSelectedStatus('all')
    setSelectedPlatform('all')
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Tournaments
          </h1>
          <p className="text-white/50 mb-4">
            Discover active tournaments across all games. Find a tournament you like, download the game, and compete!
          </p>
          
          {/* Info banner */}
          <div className="p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
            <div className="flex items-start gap-3">
              <Gamepad2 className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white/70">
                  <span className="text-neon-cyan font-semibold">Tournaments are played in-app.</span> Browse available tournaments below, then download the game to join and compete for prizes.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gaming-light border border-gaming-border rounded-xl
                  text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50
                  transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter toggle button (mobile) */}
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
              leftIcon={<SlidersHorizontal className="w-5 h-5" />}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-neon-cyan text-gaming-dark text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Desktop filters */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Game filter */}
              <div className="relative">
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-gaming-light border border-gaming-border rounded-xl
                    text-white focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
                >
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
              </div>

              {/* Entry fee filter */}
              <div className="relative">
                <select
                  value={selectedFeeRange}
                  onChange={(e) => setSelectedFeeRange(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-gaming-light border border-gaming-border rounded-xl
                    text-white focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
                >
                  {entryFeeRanges.map((range) => (
                    <option key={range.id} value={range.id}>{range.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
              </div>

              {/* Mode filter */}
              <div className="relative">
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-gaming-light border border-gaming-border rounded-xl
                    text-white focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
                >
                  {modes.map((mode) => (
                    <option key={mode.id} value={mode.id}>{mode.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-gaming-light border border-gaming-border rounded-xl
                    text-white focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
              </div>

              {/* Platform filter */}
              <div className="relative">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-gaming-light border border-gaming-border rounded-xl
                    text-white focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
                >
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>{platform.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Mobile filters dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden mt-4 overflow-hidden"
              >
                <div className="p-4 bg-gaming-light rounded-xl border border-gaming-border space-y-4">
                  {/* Game filter */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Game</label>
                    <select
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="w-full px-4 py-2 bg-gaming-darker border border-gaming-border rounded-lg text-white"
                    >
                      {games.map((game) => (
                        <option key={game.id} value={game.id}>{game.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Entry fee filter */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Entry Fee</label>
                    <select
                      value={selectedFeeRange}
                      onChange={(e) => setSelectedFeeRange(e.target.value)}
                      className="w-full px-4 py-2 bg-gaming-darker border border-gaming-border rounded-lg text-white"
                    >
                      {entryFeeRanges.map((range) => (
                        <option key={range.id} value={range.id}>{range.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mode filter */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Mode</label>
                    <select
                      value={selectedMode}
                      onChange={(e) => setSelectedMode(e.target.value)}
                      className="w-full px-4 py-2 bg-gaming-darker border border-gaming-border rounded-lg text-white"
                    >
                      {modes.map((mode) => (
                        <option key={mode.id} value={mode.id}>{mode.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status filter */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-gaming-darker border border-gaming-border rounded-lg text-white"
                    >
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear filters */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="w-full py-2 text-sm text-neon-cyan hover:text-white transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/50">
            {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Tournament Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTournaments.length > 0 ? (
              filteredTournaments.map((tournament, index) => {
                const minPlayersMet = tournament.players >= tournament.minPlayers
                const isFull = tournament.players >= tournament.maxPlayers
                const isHeadsUp = tournament.maxPlayers === 2
                const fillPercentage = (tournament.players / tournament.maxPlayers) * 100
                const minThresholdPercentage = (tournament.minPlayers / tournament.maxPlayers) * 100

                const regEndDate = new Date(tournament.registrationEnds)
                const tourneyEndDate = new Date(tournament.tournamentEnds)
                const now = new Date()
                const daysUntilRegEnds = Math.ceil((regEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <motion.div
                    key={tournament.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card hover={false} className="overflow-hidden">
                      {/* Urgency Alert Banner */}
                      {(() => {
                        const spotsLeft = tournament.maxPlayers - tournament.players
                        const playersNeeded = tournament.minPlayers - tournament.players
                        const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0
                        const isEndingSoon = daysUntilRegEnds <= 1 && daysUntilRegEnds >= 0
                        const needsOneMore = playersNeeded === 1
                        const needsFewMore = playersNeeded > 0 && playersNeeded <= 3
                        
                        if (needsOneMore) {
                          return (
                            <div className="px-4 py-2 bg-gradient-to-r from-neon-green/20 to-emerald-500/20 border-b border-neon-green/30 flex items-center justify-center gap-2 animate-pulse">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
                              </span>
                              <span className="text-sm font-semibold text-neon-green">
                                🎯 Just 1 more player needed to start!
                              </span>
                            </div>
                          )
                        }
                        
                        if (needsFewMore && !isHeadsUp) {
                          return (
                            <div className="px-4 py-2 bg-gradient-to-r from-neon-cyan/20 to-primary-500/20 border-b border-neon-cyan/30 flex items-center justify-center gap-2">
                              <Zap className="w-4 h-4 text-neon-cyan" />
                              <span className="text-sm font-semibold text-neon-cyan">
                                Only {playersNeeded} more players needed to start!
                              </span>
                            </div>
                          )
                        }
                        
                        if (isAlmostFull) {
                          return (
                            <div className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30 flex items-center justify-center gap-2 animate-pulse">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                              </span>
                              <span className="text-sm font-semibold text-orange-400">
                                🔥 Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
                              </span>
                            </div>
                          )
                        }
                        
                        if (isEndingSoon && tournament.status === 'registering') {
                          return (
                            <div className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-b border-red-500/30 flex items-center justify-center gap-2 animate-pulse">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              <span className="text-sm font-semibold text-red-400">
                                ⏰ Registration closes {daysUntilRegEnds === 0 ? 'TODAY' : 'TOMORROW'}!
                              </span>
                            </div>
                          )
                        }
                        
                        // High prize pool indicator
                        if (tournament.currentPrizePool >= 100) {
                          return (
                            <div className="px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20 flex items-center justify-center gap-2">
                              <Trophy className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-semibold text-yellow-400">
                                💰 Hot Tournament - {formatCurrency(tournament.currentPrizePool)} Prize Pool!
                              </span>
                            </div>
                          )
                        }
                        
                        return null
                      })()}
                      
                      <div className="p-4 sm:p-6">
                        {/* Header row */}
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-4">
                            {/* Game icon */}
                            <Link to={`/games/${tournament.gameId}`} className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-xl overflow-hidden border border-gaming-border hover:border-neon-cyan/50 transition-colors">
                                <img
                                  src={tournament.gameIcon}
                                  alt={tournament.gameName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </Link>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {/* Mode badge */}
                                <div className={cn(
                                  'flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
                                  tournament.mode === 'sync'
                                    ? 'bg-neon-cyan/10 text-neon-cyan'
                                    : 'bg-neon-purple/10 text-neon-purple'
                                )}>
                                  {tournament.mode === 'sync' ? (
                                    <Zap className="w-3 h-3" />
                                  ) : (
                                    <Clock className="w-3 h-3" />
                                  )}
                                  {tournament.mode === 'sync' ? '1v1' : 'Async'}
                                </div>

                                {/* Status badges */}
                                {tournament.status === 'waiting' && (
                                  <Badge variant="warning" size="sm" pulse>Waiting for Opponent</Badge>
                                )}
                                {tournament.status === 'ready' && (
                                  <Badge variant="success" size="sm" pulse>Ready to Start</Badge>
                                )}
                                {tournament.status === 'live' && (
                                  <Badge variant="danger" size="sm" pulse>LIVE</Badge>
                                )}
                                {tournament.status === 'registering' && !isFull && (
                                  <Badge variant="info" size="sm">Open</Badge>
                                )}
                                {isFull && (
                                  <Badge variant="default" size="sm">Full</Badge>
                                )}
                              </div>

                              <h3 className="font-display font-semibold text-lg text-white truncate">
                                {tournament.name}
                              </h3>

                              <div className="flex items-center gap-2 text-sm text-white/50">
                                <Gamepad2 className="w-4 h-4" />
                                <Link 
                                  to={`/games/${tournament.gameId}`}
                                  className="hover:text-neon-cyan transition-colors"
                                >
                                  {tournament.gameName}
                                </Link>
                                <span>•</span>
                                <span>{tournament.description}</span>
                              </div>
                            </div>
                          </div>

                          {/* Entry fee & Platform buttons */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gaming-darker border border-gaming-border">
                              <span className="text-white/50 text-sm">Entry:</span>
                              <span className="font-display font-bold text-white text-lg">
                                {formatCurrency(tournament.entryFee)}
                              </span>
                            </div>
                            
                            {/* Platform-specific download buttons */}
                            <div className="flex items-center gap-2">
                              {tournament.platforms.includes('android') && (
                                <Link to={`/games/${tournament.gameId}?platform=android`}>
                                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 transition-colors text-sm font-medium">
                                    <Smartphone className="w-4 h-4" />
                                    Android
                                  </button>
                                </Link>
                              )}
                              {tournament.platforms.includes('ios') && (
                                <Link to={`/games/${tournament.gameId}?platform=ios`}>
                                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-medium">
                                    <Apple className="w-4 h-4" />
                                    iOS
                                  </button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          {/* Prize Pool */}
                          <div className="p-3 rounded-lg bg-gaming-darker border border-neon-green/20">
                            <div className="flex items-center gap-2 mb-1">
                              <Trophy className="w-4 h-4 text-neon-green" />
                              <span className="text-xs text-white/50">Prize Pool</span>
                            </div>
                            <div className="font-display font-bold text-lg text-neon-green">
                              {formatCurrency(tournament.currentPrizePool)}
                            </div>
                          </div>

                          {/* Players */}
                          <div className="p-3 rounded-lg bg-gaming-darker border border-gaming-border">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="w-4 h-4 text-neon-cyan" />
                              <span className="text-xs text-white/50">Players</span>
                            </div>
                            <div className="font-display font-bold text-lg text-white">
                              {tournament.players}<span className="text-white/30 text-sm">/{tournament.maxPlayers}</span>
                            </div>
                          </div>

                          {/* Registration Ends */}
                          <div className="p-3 rounded-lg bg-gaming-darker border border-gaming-border">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-neon-purple" />
                              <span className="text-xs text-white/50">Reg. Ends</span>
                            </div>
                            <div className="font-display font-bold text-lg text-white">
                              {daysUntilRegEnds > 0 ? `${daysUntilRegEnds}d` : 'Today'}
                            </div>
                          </div>

                          {/* Tournament Ends */}
                          <div className="p-3 rounded-lg bg-gaming-darker border border-gaming-border">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-white/50" />
                              <span className="text-xs text-white/50">Ends</span>
                            </div>
                            <div className="font-display font-bold text-lg text-white">
                              {tourneyEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                            <span>{tournament.players} joined</span>
                            <span className={minPlayersMet ? 'text-neon-green' : ''}>
                              {minPlayersMet ? '✓ Min met' : `${tournament.minPlayers - tournament.players} more needed`}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gaming-darker rounded-full overflow-hidden relative">
                            {!isHeadsUp && (
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
                                style={{ left: `${minThresholdPercentage}%` }}
                              />
                            )}
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
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gaming-light flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">
                  No tournaments found
                </h3>
                <p className="text-white/50 mb-4">
                  Try adjusting your filters or check back later for new tournaments
                </p>
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/40">
            Click "Get App" to visit the game page and download. All tournaments are played within the mobile app.
          </p>
        </div>
      </div>
    </div>
  )
}