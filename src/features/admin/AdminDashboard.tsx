import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
  Shield,
  Search,
  Filter,
  X,
  Trophy,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  MessageSquare
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Admin sections
type AdminSection = 'overview' | 'games' | 'users' | 'disputes' | 'finance'

// Mock platform stats
const platformStats = {
  totalUsers: 15847,
  userGrowth: 12.5,
  activeUsers: 3421,
  totalGames: 48,
  pendingGames: 7,
  totalTournaments: 1256,
  activeTournaments: 23,
  totalPrizePool: 458750,
  platformRevenue: 45875,
  revenueGrowth: 8.3,
  disputesOpen: 12,
  disputesResolved: 234,
}

// Mock pending games
const mockPendingGames = [
  {
    id: '1',
    name: 'Pixel Warriors',
    developer: 'GameStudio Pro',
    developerEmail: 'dev@gamestudiopro.com',
    genre: 'Action',
    platform: 'Unity',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    icon: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop',
    description: 'Fast-paced pixel art action game with unique combat mechanics.',
    status: 'pending' as const,
  },
  {
    id: '2',
    name: 'Math Blitz',
    developer: 'EduGames Inc',
    developerEmail: 'hello@edugames.com',
    genre: 'Puzzle',
    platform: 'Unity',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    icon: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=100&h=100&fit=crop',
    description: 'Educational math puzzle game for competitive speed solving.',
    status: 'pending' as const,
  },
  {
    id: '3',
    name: 'Drift Kings',
    developer: 'RacingDev',
    developerEmail: 'team@racingdev.io',
    genre: 'Racing',
    platform: 'Unreal',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    icon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    description: 'Competitive drifting game with realistic physics and tracks.',
    status: 'pending' as const,
  },
]

// Mock users
const mockUsers = [
  {
    id: '1',
    username: 'ProGamer_X',
    email: 'progamer@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    tier: 'Diamond',
    totalEarnings: 12450,
    tournamentsPlayed: 156,
    winRate: 68,
    status: 'active' as const,
    joinedAt: '2024-01-15',
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    flags: 0,
  },
  {
    id: '2',
    username: 'SpeedRunner99',
    email: 'speedrunner@example.com',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    tier: 'Platinum',
    totalEarnings: 8320,
    tournamentsPlayed: 98,
    winRate: 54,
    status: 'active' as const,
    joinedAt: '2024-02-20',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    flags: 1,
  },
  {
    id: '3',
    username: 'SuspiciousPlayer',
    email: 'suspicious@example.com',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop',
    tier: 'Gold',
    totalEarnings: 15680,
    tournamentsPlayed: 45,
    winRate: 89,
    status: 'flagged' as const,
    joinedAt: '2024-03-01',
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    flags: 3,
  },
  {
    id: '4',
    username: 'BannedCheater',
    email: 'cheater@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    tier: 'Silver',
    totalEarnings: 0,
    tournamentsPlayed: 12,
    winRate: 100,
    status: 'banned' as const,
    joinedAt: '2024-03-15',
    lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    flags: 5,
  },
]

// Mock disputes
const mockDisputes = [
  {
    id: '1',
    type: 'score_dispute' as const,
    reporter: 'ProGamer_X',
    reported: 'SuspiciousPlayer',
    tournamentId: 'T-1234',
    tournamentName: 'Speed Racer Championship',
    description: 'Opponent achieved impossible score of 999999 in 30 seconds.',
    status: 'open' as const,
    priority: 'high' as const,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'payment_issue' as const,
    reporter: 'SpeedRunner99',
    reported: null,
    tournamentId: 'T-1198',
    tournamentName: 'Weekly Puzzle Masters',
    description: 'Prize not received after winning 2nd place 3 days ago.',
    status: 'in_progress' as const,
    priority: 'medium' as const,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'harassment' as const,
    reporter: 'CasualGamer42',
    reported: 'ToxicPlayer123',
    tournamentId: null,
    tournamentName: null,
    description: 'Received threatening messages after tournament match.',
    status: 'open' as const,
    priority: 'high' as const,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Tier colors
const tierColors: Record<string, string> = {
  Bronze: 'text-amber-600',
  Silver: 'text-gray-400',
  Gold: 'text-yellow-400',
  Platinum: 'text-cyan-300',
  Diamond: 'text-purple-400',
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState<typeof mockPendingGames[0] | null>(null)
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null)

  // Sections config
  const sections = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'games' as const, label: 'Games', icon: Gamepad2, badge: platformStats.pendingGames },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'disputes' as const, label: 'Disputes', icon: AlertTriangle, badge: platformStats.disputesOpen },
    { id: 'finance' as const, label: 'Finance', icon: DollarSign },
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-neon-purple" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-white/50">Manage platform, approve games, and handle disputes</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left',
                        activeSection === section.id
                          ? 'bg-neon-purple/20 text-neon-purple'
                          : 'text-white/70 hover:bg-gaming-light hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{section.label}</span>
                      </div>
                      {section.badge && section.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-neon-red/20 text-neon-red text-xs font-medium">
                          {section.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Users"
                    value={platformStats.totalUsers.toLocaleString()}
                    change={platformStats.userGrowth}
                    icon={Users}
                    color="cyan"
                  />
                  <StatCard
                    label="Active Now"
                    value={platformStats.activeUsers.toLocaleString()}
                    icon={Activity}
                    color="green"
                  />
                  <StatCard
                    label="Platform Revenue"
                    value={`$${(platformStats.platformRevenue / 1000).toFixed(1)}K`}
                    change={platformStats.revenueGrowth}
                    icon={DollarSign}
                    color="yellow"
                  />
                  <StatCard
                    label="Total Prize Pool"
                    value={`$${(platformStats.totalPrizePool / 1000).toFixed(1)}K`}
                    icon={Trophy}
                    color="purple"
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6">
                    <h3 className="text-sm font-medium text-white/50 mb-4">Games</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Total Games</span>
                        <span className="text-white font-semibold">{platformStats.totalGames}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Pending Approval</span>
                        <span className="text-yellow-400 font-semibold">{platformStats.pendingGames}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-sm font-medium text-white/50 mb-4">Tournaments</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Total Tournaments</span>
                        <span className="text-white font-semibold">{platformStats.totalTournaments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Active Now</span>
                        <span className="text-neon-green font-semibold">{platformStats.activeTournaments}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-sm font-medium text-white/50 mb-4">Disputes</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Open</span>
                        <span className="text-neon-red font-semibold">{platformStats.disputesOpen}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Resolved (All Time)</span>
                        <span className="text-neon-green font-semibold">{platformStats.disputesResolved}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="font-display text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Gamepad2, text: 'New game "Pixel Warriors" submitted for review', time: '2 hours ago', color: 'text-neon-cyan' },
                      { icon: Trophy, text: 'Tournament "Speed Racer Championship" completed', time: '4 hours ago', color: 'text-yellow-400' },
                      { icon: AlertTriangle, text: 'New dispute opened: Score manipulation report', time: '5 hours ago', color: 'text-neon-red' },
                      { icon: Users, text: '150 new users registered today', time: '6 hours ago', color: 'text-neon-green' },
                      { icon: DollarSign, text: '$2,500 in prizes distributed', time: '8 hours ago', color: 'text-neon-purple' },
                    ].map((activity, i) => {
                      const Icon = activity.icon
                      return (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gaming-light/50 transition-colors">
                          <Icon className={cn('w-5 h-5', activity.color)} />
                          <span className="flex-1 text-white/80">{activity.text}</span>
                          <span className="text-sm text-white/40">{activity.time}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* Games Section */}
            {activeSection === 'games' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold text-white">Pending Game Approvals</h2>
                    <span className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 text-sm font-medium">
                      {mockPendingGames.length} pending
                    </span>
                  </div>

                  <div className="space-y-4">
                    {mockPendingGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gaming-light hover:bg-gaming-light/80 transition-colors"
                      >
                        <img
                          src={game.icon}
                          alt={game.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{game.name}</h3>
                            <span className="px-2 py-0.5 rounded bg-gaming-darker text-white/50 text-xs">
                              {game.genre}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-gaming-darker text-white/50 text-xs">
                              {game.platform}
                            </span>
                          </div>
                          <div className="text-sm text-white/50 mb-1">{game.developer}</div>
                          <div className="text-sm text-white/40">
                            Submitted {new Date(game.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGame(game)}
                            leftIcon={<Eye className="w-4 h-4" />}
                          >
                            Review
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neon-red hover:bg-neon-red/10"
                            leftIcon={<XCircle className="w-4 h-4" />}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Users Section */}
            {activeSection === 'users' && (
              <div className="space-y-6">
                {/* Search & Filters */}
                <Card className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gaming-border bg-gaming-darker text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                      />
                    </div>
                    <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />}>
                      Filters
                    </Button>
                  </div>
                </Card>

                {/* User List */}
                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-gaming-border">
                    <h2 className="font-display text-lg font-semibold text-white">User Management</h2>
                  </div>
                  <div className="divide-y divide-gaming-border">
                    {mockUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 hover:bg-gaming-light/50 transition-colors"
                      >
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{user.username}</span>
                            <span className={cn('text-sm font-medium', tierColors[user.tier])}>
                              {user.tier}
                            </span>
                            {user.status === 'flagged' && (
                              <span className="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400 text-xs font-medium">
                                Flagged ({user.flags})
                              </span>
                            )}
                            {user.status === 'banned' && (
                              <span className="px-2 py-0.5 rounded bg-neon-red/20 text-neon-red text-xs font-medium">
                                Banned
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-white/50">{user.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/70">
                            ${user.totalEarnings.toLocaleString()} earned
                          </div>
                          <div className="text-xs text-white/40">
                            {user.tournamentsPlayed} tournaments • {user.winRate}% win rate
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            leftIcon={<Eye className="w-4 h-4" />}
                          >
                            View
                          </Button>
                          {user.status !== 'banned' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-neon-red hover:bg-neon-red/10"
                              leftIcon={<Ban className="w-4 h-4" />}
                            >
                              Ban
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-neon-green hover:bg-neon-green/10"
                              leftIcon={<CheckCircle2 className="w-4 h-4" />}
                            >
                              Unban
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Disputes Section */}
            {activeSection === 'disputes' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold text-white">Open Disputes</h2>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-neon-red/20 text-neon-red text-sm font-medium">
                        {mockDisputes.filter(d => d.status === 'open').length} open
                      </span>
                      <span className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 text-sm font-medium">
                        {mockDisputes.filter(d => d.status === 'in_progress').length} in progress
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mockDisputes.map((dispute) => (
                      <div
                        key={dispute.id}
                        className={cn(
                          'p-4 rounded-xl border-l-4',
                          dispute.priority === 'high' ? 'border-l-neon-red bg-neon-red/5' :
                          dispute.priority === 'medium' ? 'border-l-yellow-400 bg-yellow-400/5' :
                          'border-l-blue-400 bg-blue-400/5'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white capitalize">
                                {dispute.type.replace('_', ' ')}
                              </span>
                              <span className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                dispute.status === 'open' ? 'bg-neon-red/20 text-neon-red' :
                                dispute.status === 'in_progress' ? 'bg-yellow-400/20 text-yellow-400' :
                                'bg-neon-green/20 text-neon-green'
                              )}>
                                {dispute.status.replace('_', ' ')}
                              </span>
                              <span className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium uppercase',
                                dispute.priority === 'high' ? 'bg-neon-red/20 text-neon-red' :
                                dispute.priority === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                                'bg-blue-400/20 text-blue-400'
                              )}>
                                {dispute.priority}
                              </span>
                            </div>
                            <div className="text-sm text-white/50">
                              Reported by <span className="text-white">{dispute.reporter}</span>
                              {dispute.reported && (
                                <> against <span className="text-neon-red">{dispute.reported}</span></>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-white/40">
                            {new Date(dispute.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-white/70 mb-3">{dispute.description}</p>
                        {dispute.tournamentName && (
                          <div className="text-sm text-white/50 mb-3">
                            Tournament: <span className="text-neon-cyan">{dispute.tournamentName}</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                            Investigate
                          </Button>
                          <Button variant="ghost" size="sm" leftIcon={<MessageSquare className="w-4 h-4" />}>
                            Contact
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Finance Section */}
            {activeSection === 'finance' && (
              <div className="space-y-6">
                {/* Revenue Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Platform Revenue"
                    value={`$${platformStats.platformRevenue.toLocaleString()}`}
                    change={platformStats.revenueGrowth}
                    icon={DollarSign}
                    color="green"
                  />
                  <StatCard
                    label="Total Prize Pool"
                    value={`$${platformStats.totalPrizePool.toLocaleString()}`}
                    icon={Trophy}
                    color="yellow"
                  />
                  <StatCard
                    label="Avg. Entry Fee"
                    value="$8.50"
                    icon={Zap}
                    color="cyan"
                  />
                  <StatCard
                    label="Pending Payouts"
                    value="$12,450"
                    icon={Clock}
                    color="purple"
                  />
                </div>

                {/* Revenue Breakdown */}
                <Card className="p-6">
                  <h3 className="font-display text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Tournament Fees (10%)', amount: 35700, color: 'bg-neon-cyan' },
                      { label: 'Premium Subscriptions', amount: 8500, color: 'bg-neon-purple' },
                      { label: 'Sponsored Tournaments', amount: 1675, color: 'bg-yellow-400' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-white/70">{item.label}</span>
                          <span className="text-white font-semibold">${item.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-gaming-darker rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', item.color)}
                            style={{ width: `${(item.amount / platformStats.platformRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recent Transactions */}
                <Card className="p-6">
                  <h3 className="font-display text-lg font-semibold text-white mb-4">Recent Platform Transactions</h3>
                  <div className="space-y-3">
                    {[
                      { type: 'in', label: 'Tournament Fees', amount: 1250, time: '2 hours ago' },
                      { type: 'out', label: 'Prize Distribution', amount: 4500, time: '4 hours ago' },
                      { type: 'in', label: 'Tournament Fees', amount: 890, time: '6 hours ago' },
                      { type: 'out', label: 'Developer Payout', amount: 2100, time: '8 hours ago' },
                      { type: 'in', label: 'Premium Subscription', amount: 99, time: '10 hours ago' },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gaming-light/50 transition-colors">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          tx.type === 'in' ? 'bg-neon-green/20' : 'bg-neon-red/20'
                        )}>
                          {tx.type === 'in' ? (
                            <ArrowDownLeft className="w-5 h-5 text-neon-green" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-neon-red" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{tx.label}</div>
                          <div className="text-sm text-white/40">{tx.time}</div>
                        </div>
                        <div className={cn(
                          'font-display font-semibold',
                          tx.type === 'in' ? 'text-neon-green' : 'text-white'
                        )}>
                          {tx.type === 'in' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Game Review Modal */}
      <AnimatePresence>
        {selectedGame && (
          <Modal onClose={() => setSelectedGame(null)} title="Game Review">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedGame.icon}
                  alt={selectedGame.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-display text-xl font-semibold text-white">{selectedGame.name}</h3>
                  <div className="text-white/50">{selectedGame.developer}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 rounded bg-gaming-light text-white/70 text-sm">{selectedGame.genre}</span>
                    <span className="px-2 py-1 rounded bg-gaming-light text-white/70 text-sm">{selectedGame.platform}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white/50 mb-2">Description</h4>
                <p className="text-white/80">{selectedGame.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white/50 mb-2">Developer Contact</h4>
                <p className="text-white/80">{selectedGame.developerEmail}</p>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gaming-border">
                <Button variant="primary" className="flex-1" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Approve Game
                </Button>
                <Button variant="ghost" className="flex-1 text-neon-red hover:bg-neon-red/10" leftIcon={<XCircle className="w-4 h-4" />}>
                  Reject Game
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <Modal onClose={() => setSelectedUser(null)} title="User Details">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-display text-xl font-semibold text-white">{selectedUser.username}</h3>
                  <div className="text-white/50">{selectedUser.email}</div>
                  <div className={cn('text-sm font-medium mt-1', tierColors[selectedUser.tier])}>
                    {selectedUser.tier} Tier
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gaming-light">
                  <div className="text-sm text-white/50">Total Earnings</div>
                  <div className="font-display text-xl font-semibold text-neon-green">
                    ${selectedUser.totalEarnings.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gaming-light">
                  <div className="text-sm text-white/50">Win Rate</div>
                  <div className="font-display text-xl font-semibold text-white">
                    {selectedUser.winRate}%
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gaming-light">
                  <div className="text-sm text-white/50">Tournaments</div>
                  <div className="font-display text-xl font-semibold text-white">
                    {selectedUser.tournamentsPlayed}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gaming-light">
                  <div className="text-sm text-white/50">Flags</div>
                  <div className={cn(
                    'font-display text-xl font-semibold',
                    selectedUser.flags > 0 ? 'text-neon-red' : 'text-neon-green'
                  )}>
                    {selectedUser.flags}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gaming-border">
                <Button variant="ghost" className="flex-1" leftIcon={<Eye className="w-4 h-4" />}>
                  View Full Profile
                </Button>
                {selectedUser.status !== 'banned' ? (
                  <Button variant="ghost" className="flex-1 text-neon-red hover:bg-neon-red/10" leftIcon={<Ban className="w-4 h-4" />}>
                    Ban User
                  </Button>
                ) : (
                  <Button variant="ghost" className="flex-1 text-neon-green hover:bg-neon-green/10" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                    Unban User
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  change?: number
  icon: typeof Users
  color: 'cyan' | 'green' | 'yellow' | 'purple' | 'red'
}) {
  const colorClasses = {
    cyan: 'bg-neon-cyan/20 text-neon-cyan',
    green: 'bg-neon-green/20 text-neon-green',
    yellow: 'bg-yellow-400/20 text-yellow-400',
    purple: 'bg-neon-purple/20 text-neon-purple',
    red: 'bg-neon-red/20 text-neon-red',
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-white/50">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-display text-2xl font-bold text-white">{value}</span>
        {change !== undefined && (
          <span className={cn(
            'flex items-center gap-1 text-sm font-medium',
            change >= 0 ? 'text-neon-green' : 'text-neon-red'
          )}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </Card>
  )
}

// Modal Component
function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gaming-dark border border-gaming-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gaming-light text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}