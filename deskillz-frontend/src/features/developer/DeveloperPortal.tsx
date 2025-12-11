import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Gamepad2,
  Upload,
  DollarSign,
  FileCode,
  Settings,
  Users,
  Trophy,
  CheckCircle,
  Clock,
  ChevronRight,
  Download,
  Copy,
  ExternalLink,
  Plus,
  Smartphone,
  Apple,
  AlertCircle,
  BookOpen
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, cn } from '@/lib/utils'

// Mock developer data
const mockDeveloper = {
  name: 'GameStudio Pro',
  email: 'dev@gamestudio.com',
  apiKey: 'dsk_live_a1b2c3d4e5f6g7h8i9j0...',
  fullApiKey: 'dsk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  joinedDate: '2024-03-15',
  tier: 'Pro',
  revenueShare: 70,
}

// Mock stats
const mockStats = {
  totalRevenue: 12450.00,
  pendingPayout: 1250.00,
  lastPayout: 2500.00,
  lastPayoutDate: '2024-12-01',
  totalPlayers: 8542,
  activePlayers: 1234,
  totalTournaments: 156,
  activeTournaments: 12,
}

// Mock games
const mockGames = [
  {
    id: '1',
    name: 'Speed Racer X',
    icon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    status: 'live',
    platforms: ['android', 'ios'],
    sdkVersion: '2.1.0',
    revenue: 5420.00,
    players: 3250,
    tournaments: 45,
    activeTournaments: 5,
    submittedDate: '2024-04-10',
    approvedDate: '2024-04-15',
  },
  {
    id: '2',
    name: 'Puzzle Master',
    icon: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=100&h=100&fit=crop',
    status: 'live',
    platforms: ['android'],
    sdkVersion: '2.1.0',
    revenue: 3180.00,
    players: 2890,
    tournaments: 67,
    activeTournaments: 4,
    submittedDate: '2024-05-20',
    approvedDate: '2024-05-25',
  },
  {
    id: '3',
    name: 'Card Warriors',
    icon: 'https://images.unsplash.com/photo-1529480780361-4e1b499781e4?w=100&h=100&fit=crop',
    status: 'pending',
    platforms: ['android', 'ios'],
    sdkVersion: '2.1.0',
    revenue: 0,
    players: 0,
    tournaments: 0,
    activeTournaments: 0,
    submittedDate: '2024-12-08',
    approvedDate: null,
  },
  {
    id: '4',
    name: 'Word Quest',
    icon: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=100&h=100&fit=crop',
    status: 'rejected',
    platforms: ['ios'],
    sdkVersion: '2.0.5',
    revenue: 0,
    players: 0,
    tournaments: 0,
    activeTournaments: 0,
    submittedDate: '2024-11-15',
    approvedDate: null,
    rejectionReason: 'SDK version outdated. Please update to v2.1.0+',
  },
]

// Mock revenue data
const mockRevenueHistory = [
  { month: 'Jul', revenue: 1200 },
  { month: 'Aug', revenue: 1800 },
  { month: 'Sep', revenue: 2100 },
  { month: 'Oct', revenue: 2400 },
  { month: 'Nov', revenue: 2700 },
  { month: 'Dec', revenue: 2250 },
]

// Mock payouts
const mockPayouts = [
  { id: '1', amount: 2500, date: '2024-12-01', status: 'completed', txHash: 'abc123...' },
  { id: '2', amount: 2200, date: '2024-11-01', status: 'completed', txHash: 'def456...' },
  { id: '3', amount: 1800, date: '2024-10-01', status: 'completed', txHash: 'ghi789...' },
  { id: '4', amount: 1500, date: '2024-09-01', status: 'completed', txHash: 'jkl012...' },
]

type TabType = 'dashboard' | 'games' | 'upload' | 'revenue' | 'sdk' | 'settings'

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [copiedKey, setCopiedKey] = useState(false)

  const copyApiKey = () => {
    navigator.clipboard.writeText(mockDeveloper.fullApiKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'games', label: 'My Games', icon: Gamepad2 },
    { id: 'upload', label: 'Upload Game', icon: Upload },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'sdk', label: 'SDK Docs', icon: FileCode },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white mb-1">
                Developer Portal
              </h1>
              <p className="text-white/50">
                Manage your games, track revenue, and integrate with our SDK
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="info">{mockDeveloper.tier} Developer</Badge>
              <Badge variant="success">{mockDeveloper.revenueShare}% Revenue Share</Badge>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-1 p-1 bg-gaming-light rounded-xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-neon-cyan text-gaming-dark'
                    : 'text-white/50 hover:text-white hover:bg-gaming-darker'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && <DashboardTab copyApiKey={copyApiKey} copiedKey={copiedKey} />}
          {activeTab === 'games' && <GamesTab />}
          {activeTab === 'upload' && <UploadTab />}
          {activeTab === 'revenue' && <RevenueTab />}
          {activeTab === 'sdk' && <SDKDocsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </motion.div>
      </div>
    </div>
  )
}

function DashboardTab({ copyApiKey, copiedKey }: { copyApiKey: () => void; copiedKey: boolean }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-neon-green/10">
              <DollarSign className="w-5 h-5 text-neon-green" />
            </div>
            <span className="text-sm text-white/50">Total Revenue</span>
          </div>
          <div className="font-display text-2xl font-bold text-neon-green">
            {formatCurrency(mockStats.totalRevenue)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-neon-cyan/10">
              <Clock className="w-5 h-5 text-neon-cyan" />
            </div>
            <span className="text-sm text-white/50">Pending Payout</span>
          </div>
          <div className="font-display text-2xl font-bold text-neon-cyan">
            {formatCurrency(mockStats.pendingPayout)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-neon-purple/10">
              <Users className="w-5 h-5 text-neon-purple" />
            </div>
            <span className="text-sm text-white/50">Total Players</span>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {mockStats.totalPlayers.toLocaleString()}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Trophy className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-sm text-white/50">Active Tournaments</span>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {mockStats.activeTournaments}
          </div>
        </Card>
      </div>

      {/* API Key */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white">API Key</h2>
          <Badge variant="warning" size="sm">Keep Secret</Badge>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gaming-darker">
          <code className="flex-1 font-mono text-sm text-white/70">{mockDeveloper.apiKey}</code>
          <button
            onClick={copyApiKey}
            className="p-2 hover:bg-gaming-light rounded-lg transition-colors"
          >
            {copiedKey ? (
              <CheckCircle className="w-5 h-5 text-neon-green" />
            ) : (
              <Copy className="w-5 h-5 text-white/50" />
            )}
          </button>
        </div>
        <p className="text-sm text-white/40 mt-2">
          Use this key to authenticate SDK requests. Never expose it in client-side code.
        </p>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 hover:border-neon-cyan/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-neon-cyan/10">
              <Upload className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <div className="font-semibold text-white">Upload New Game</div>
              <div className="text-sm text-white/50">Submit a game for review</div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
          </div>
        </Card>

        <Card className="p-4 hover:border-neon-cyan/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-neon-green/10">
              <Download className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <div className="font-semibold text-white">Download SDK</div>
              <div className="text-sm text-white/50">Unity & Unreal plugins</div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
          </div>
        </Card>

        <Card className="p-4 hover:border-neon-cyan/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-neon-purple/10">
              <BookOpen className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <div className="font-semibold text-white">View Documentation</div>
              <div className="text-sm text-white/50">Integration guides</div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
          </div>
        </Card>
      </div>

      {/* My Games Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white">My Games</h2>
          <span className="text-sm text-white/50">{mockGames.length} games</span>
        </div>
        <div className="space-y-3">
          {mockGames.slice(0, 3).map((game) => (
            <div
              key={game.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-gaming-darker"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden">
                <img src={game.icon} alt={game.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{game.name}</span>
                  {game.status === 'live' && <Badge variant="success" size="sm">Live</Badge>}
                  {game.status === 'pending' && <Badge variant="warning" size="sm">Pending</Badge>}
                  {game.status === 'rejected' && <Badge variant="danger" size="sm">Rejected</Badge>}
                </div>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <span>{game.players.toLocaleString()} players</span>
                  <span>•</span>
                  <span>{formatCurrency(game.revenue)} revenue</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function GamesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-white">My Games</h2>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Upload New Game
        </Button>
      </div>

      <div className="space-y-4">
        {mockGames.map((game) => (
          <Card key={game.id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Game Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl overflow-hidden">
                  <img src={game.icon} alt={game.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-semibold text-white">{game.name}</h3>
                    {game.status === 'live' && <Badge variant="success">Live</Badge>}
                    {game.status === 'pending' && <Badge variant="warning">Pending Review</Badge>}
                    {game.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <FileCode className="w-4 h-4" />
                      SDK v{game.sdkVersion}
                    </span>
                    <span className="flex items-center gap-1">
                      {game.platforms.includes('android') && <Smartphone className="w-4 h-4" />}
                      {game.platforms.includes('ios') && <Apple className="w-4 h-4" />}
                    </span>
                    <span>
                      Submitted {new Date(game.submittedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats (only for live games) */}
              {game.status === 'live' && (
                <div className="grid grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-neon-green">
                      {formatCurrency(game.revenue)}
                    </div>
                    <div className="text-xs text-white/50">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-white">
                      {game.players.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/50">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-white">
                      {game.tournaments}
                    </div>
                    <div className="text-xs text-white/50">Tournaments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-neon-cyan">
                      {game.activeTournaments}
                    </div>
                    <div className="text-xs text-white/50">Active</div>
                  </div>
                </div>
              )}

              {/* Rejection reason */}
              {game.status === 'rejected' && game.rejectionReason && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-400">Rejection Reason</div>
                    <div className="text-sm text-white/70">{game.rejectionReason}</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {game.status === 'live' && (
                  <>
                    <Button variant="secondary" size="sm">Analytics</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </>
                )}
                {game.status === 'pending' && (
                  <Button variant="ghost" size="sm">View Status</Button>
                )}
                {game.status === 'rejected' && (
                  <Button variant="primary" size="sm">Resubmit</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function UploadTab() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <h2 className="font-display text-2xl font-bold text-white mb-2">Upload New Game</h2>
        <p className="text-white/50 mb-8">Submit your game for review. Once approved, it will be live on the platform.</p>

        <form className="space-y-6">
          {/* Game Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Game Name</label>
            <input
              type="text"
              placeholder="Enter your game name"
              className="w-full px-4 py-3 bg-gaming-darker border border-gaming-border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              rows={4}
              placeholder="Describe your game..."
              className="w-full px-4 py-3 bg-gaming-darker border border-gaming-border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 resize-none"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Genre</label>
            <select className="w-full px-4 py-3 bg-gaming-darker border border-gaming-border rounded-xl text-white focus:outline-none focus:border-neon-cyan/50">
              <option value="">Select genre</option>
              <option value="racing">Racing</option>
              <option value="puzzle">Puzzle</option>
              <option value="cards">Card Games</option>
              <option value="word">Word Games</option>
              <option value="arcade">Arcade</option>
              <option value="sports">Sports</option>
              <option value="strategy">Strategy</option>
            </select>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Platforms</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gaming-border bg-gaming-darker text-neon-cyan focus:ring-neon-cyan" />
                <Smartphone className="w-4 h-4 text-neon-green" />
                <span className="text-white">Android</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gaming-border bg-gaming-darker text-neon-cyan focus:ring-neon-cyan" />
                <Apple className="w-4 h-4 text-white" />
                <span className="text-white">iOS</span>
              </label>
            </div>
          </div>

          {/* File uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Game Icon (512x512)</label>
              <div className="border-2 border-dashed border-gaming-border rounded-xl p-6 text-center hover:border-neon-cyan/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                <p className="text-sm text-white/50">Drop image or click to upload</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Banner Image (1920x1080)</label>
              <div className="border-2 border-dashed border-gaming-border rounded-xl p-6 text-center hover:border-neon-cyan/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                <p className="text-sm text-white/50">Drop image or click to upload</p>
              </div>
            </div>
          </div>

          {/* APK/IPA */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Game Build</label>
            <div className="border-2 border-dashed border-gaming-border rounded-xl p-8 text-center hover:border-neon-cyan/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-white/30 mx-auto mb-3" />
              <p className="text-white mb-1">Drop APK or IPA file</p>
              <p className="text-sm text-white/50">Max file size: 500MB</p>
            </div>
          </div>

          {/* SDK Version */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">SDK Version Used</label>
            <select className="w-full px-4 py-3 bg-gaming-darker border border-gaming-border rounded-xl text-white focus:outline-none focus:border-neon-cyan/50">
              <option value="2.1.0">v2.1.0 (Latest)</option>
              <option value="2.0.5">v2.0.5</option>
              <option value="2.0.0">v2.0.0</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button variant="primary" className="flex-1">
              Submit for Review
            </Button>
            <Button variant="secondary">
              Save Draft
            </Button>
          </div>
        </form>

        {/* Requirements */}
        <div className="mt-8 p-4 rounded-xl bg-gaming-darker">
          <h3 className="font-semibold text-white mb-3">Submission Requirements</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
              Game must integrate Deskillz SDK v2.0.0 or higher
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
              Score submission must be verified and tamper-proof
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
              No ads or in-app purchases during tournament mode
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
              Demo mode must be available for practice
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

function RevenueTab() {
  const maxRevenue = Math.max(...mockRevenueHistory.map(r => r.revenue))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-white/50 mb-1">Total Revenue</div>
          <div className="font-display text-3xl font-bold text-neon-green">
            {formatCurrency(mockStats.totalRevenue)}
          </div>
          <div className="text-sm text-white/40 mt-1">Lifetime earnings</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-white/50 mb-1">Pending Payout</div>
          <div className="font-display text-3xl font-bold text-neon-cyan">
            {formatCurrency(mockStats.pendingPayout)}
          </div>
          <div className="text-sm text-white/40 mt-1">Next payout: Jan 1, 2025</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-white/50 mb-1">Last Payout</div>
          <div className="font-display text-3xl font-bold text-white">
            {formatCurrency(mockStats.lastPayout)}
          </div>
          <div className="text-sm text-white/40 mt-1">
            {new Date(mockStats.lastPayoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-6">Revenue History</h2>
        <div className="h-64 flex items-end gap-2">
          {mockRevenueHistory.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-sm font-semibold text-white">
                {formatCurrency(item.revenue)}
              </div>
              <div
                className="w-full bg-gradient-to-t from-neon-cyan to-neon-purple rounded-t-lg transition-all hover:opacity-80"
                style={{ height: `${(item.revenue / maxRevenue) * 180}px` }}
              />
              <div className="text-xs text-white/50">{item.month}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Revenue by Game */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Revenue by Game</h2>
        <div className="space-y-4">
          {mockGames.filter(g => g.status === 'live').map((game) => {
            const percentage = (game.revenue / mockStats.totalRevenue) * 100
            return (
              <div key={game.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden">
                      <img src={game.icon} alt={game.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-medium text-white">{game.name}</span>
                  </div>
                  <span className="font-display font-semibold text-neon-green">
                    {formatCurrency(game.revenue)}
                  </span>
                </div>
                <div className="h-2 bg-gaming-darker rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Payout History */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Payout History</h2>
        <div className="space-y-3">
          {mockPayouts.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gaming-darker"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-neon-green/10">
                  <DollarSign className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <div className="font-medium text-white">{formatCurrency(payout.amount)}</div>
                  <div className="text-sm text-white/50">
                    {new Date(payout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="success" size="sm">Completed</Badge>
                <a href="#" className="text-white/50 hover:text-neon-cyan">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SDKDocsTab() {
  return (
    <div className="space-y-6">
      {/* Download SDK */}
      <Card className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-4">Download SDK</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gaming-darker border border-gaming-border hover:border-neon-cyan/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-neon-cyan/10">
                <Gamepad2 className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <div className="font-semibold text-white">Unity SDK</div>
                <div className="text-sm text-white/50">v2.1.0 • Unity 2021.3+</div>
              </div>
            </div>
            <Button variant="primary" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
              Download for Unity
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-gaming-darker border border-gaming-border hover:border-neon-cyan/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-neon-purple/10">
                <Gamepad2 className="w-6 h-6 text-neon-purple" />
              </div>
              <div>
                <div className="font-semibold text-white">Unreal SDK</div>
                <div className="text-sm text-white/50">v2.1.0 • UE 5.1+</div>
              </div>
            </div>
            <Button variant="secondary" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
              Download for Unreal
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Start */}
      <Card className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-4">Quick Start Guide</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-white mb-3">1. Initialize the SDK</h3>
            <div className="p-4 rounded-lg bg-gaming-darker font-mono text-sm overflow-x-auto">
              <pre className="text-neon-cyan">
{`// Unity C#
DeskillzSDK.Initialize("YOUR_GAME_ID", "YOUR_API_KEY");

// Set up callbacks
DeskillzSDK.OnTournamentStart += HandleTournamentStart;
DeskillzSDK.OnTournamentEnd += HandleTournamentEnd;`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">2. Start a Tournament Match</h3>
            <div className="p-4 rounded-lg bg-gaming-darker font-mono text-sm overflow-x-auto">
              <pre className="text-neon-cyan">
{`// Called when player enters tournament from app
void HandleTournamentStart(MatchInfo match) {
    // match.mode = "sync" or "async"
    // match.tournamentId
    // match.players[] (for sync mode)
    
    StartGame(match);
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">3. Submit Score</h3>
            <div className="p-4 rounded-lg bg-gaming-darker font-mono text-sm overflow-x-auto">
              <pre className="text-neon-cyan">
{`// When game ends, submit the score
DeskillzSDK.Score.Submit(
    score: playerScore,
    metadata: gameStateHash,  // For verification
    onSuccess: () => {
        Debug.Log("Score submitted!");
        ShowResults();
    },
    onError: (error) => {
        Debug.LogError(error);
    }
);`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">4. Real-time Sync (1v1 Mode)</h3>
            <div className="p-4 rounded-lg bg-gaming-darker font-mono text-sm overflow-x-auto">
              <pre className="text-neon-cyan">
{`// Send game state to opponent
DeskillzSDK.Sync.SendState(gameState);

// Receive opponent's state
DeskillzSDK.Sync.OnStateReceived += (opponentState) => {
    UpdateOpponentPosition(opponentState);
};`}
              </pre>
            </div>
          </div>
        </div>
      </Card>

      {/* API Reference Links */}
      <Card className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-4">API Reference</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Authentication', desc: 'SDK init, API keys, session management' },
            { title: 'Tournaments', desc: 'Join, leave, status, callbacks' },
            { title: 'Score System', desc: 'Submit, verify, anti-cheat' },
            { title: 'Real-time Sync', desc: 'State sync, matchmaking, latency' },
            { title: 'Analytics', desc: 'Events, crashes, sessions' },
            { title: 'Testing', desc: 'Sandbox mode, test tournaments' },
          ].map((item) => (
            <a
              key={item.title}
              href="#"
              className="flex items-center justify-between p-4 rounded-lg bg-gaming-darker hover:bg-gaming-light transition-colors"
            >
              <div>
                <div className="font-medium text-white">{item.title}</div>
                <div className="text-sm text-white/50">{item.desc}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </a>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Developer Profile */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Developer Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Studio Name</label>
            <input
              type="text"
              defaultValue={mockDeveloper.name}
              className="w-full px-4 py-3 bg-gaming-darker border border-gaming-border rounded-xl text-white focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <input
              type="email"
              defaultValue={mockDeveloper.email}
              className="w-full px-4 py-3 bg-gaming-darker border border-gaming-border rounded-xl text-white focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
          <Button variant="primary">Save Changes</Button>
        </div>
      </Card>

      {/* Payout Settings */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Payout Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Payout Wallet (TRON)</label>
            <input
              type="text"
              placeholder="Enter your TRON wallet address"
              className="w-full px-4 py-3 bg-gaming-darker border border-gaming-border rounded-xl text-white font-mono focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Minimum Payout</label>
            <select className="w-full px-4 py-3 bg-gaming-darker border border-gaming-border rounded-xl text-white focus:outline-none focus:border-neon-cyan/50">
              <option value="100">$100 USDT</option>
              <option value="250">$250 USDT</option>
              <option value="500">$500 USDT</option>
              <option value="1000">$1,000 USDT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Payout Frequency</label>
            <select className="w-full px-4 py-3 bg-gaming-darker border border-gaming-border rounded-xl text-white focus:outline-none focus:border-neon-cyan/50">
              <option value="monthly">Monthly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <Button variant="primary">Update Payout Settings</Button>
        </div>
      </Card>

      {/* API Keys */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">API Keys</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gaming-darker">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/50">Live API Key</span>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <code className="text-sm text-white/70 font-mono">{mockDeveloper.apiKey}</code>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">Regenerate Key</Button>
            <Button variant="ghost">View Full Key</Button>
          </div>
          <p className="text-sm text-white/40">
            Regenerating your API key will invalidate the current key. Make sure to update your game builds.
          </p>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-500/20">
        <h2 className="font-display text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Delete Developer Account</div>
              <div className="text-sm text-white/50">This will remove all games and data permanently</div>
            </div>
            <Button variant="ghost" className="text-red-400 hover:bg-red-500/10">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}