import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  Trophy,
  TrendingUp,
  History,
  Settings,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Gamepad2,
  Medal,
  Target,
  Calendar,
  CheckCircle,
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  User
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, cn } from '@/lib/utils'

// Mock user data
const mockUser = {
  username: 'ProGamer_2024',
  walletAddress: '0x1234...5678',
  fullWalletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  joinedDate: '2024-06-15',
  // Multi-currency balances
  balances: [
    { currency: 'ETH', symbol: 'ETH', amount: 0.125, usdValue: 245.50, color: '#627EEA' },
    { currency: 'USDT', symbol: 'USDT', amount: 150.00, usdValue: 150.00, color: '#26A17B' },
    { currency: 'SOL', symbol: 'SOL', amount: 2.5, usdValue: 125.00, color: '#9945FF' },
  ],
  totalBalanceUSD: 520.50,
  totalEarnings: 1250.00,
  totalDeposits: 500.00,
  totalWithdrawals: 750.00,
}

// Mock stats
const mockStats = {
  tournamentsPlayed: 47,
  tournamentsWon: 12,
  winRate: 25.5,
  totalPrizeWon: 1250.00,
  currentStreak: 3,
  bestStreak: 7,
  favoriteGame: 'Speed Racer X',
  rank: 'Gold',
}

// Mock transactions
const mockTransactions = [
  {
    id: '1',
    type: 'prize',
    amount: 0.025,
    currency: 'ETH',
    currencyColor: '#627EEA',
    usdValue: 45.00,
    description: 'Tournament Win - Speed Racer X',
    date: '2024-12-10T14:30:00',
    status: 'completed',
    txHash: 'abc123...',
  },
  {
    id: '2',
    type: 'entry',
    amount: -10.00,
    currency: 'USDT',
    currencyColor: '#26A17B',
    usdValue: 10.00,
    description: 'Tournament Entry - Battle Cards',
    date: '2024-12-10T12:00:00',
    status: 'completed',
    txHash: 'def456...',
  },
  {
    id: '3',
    type: 'deposit',
    amount: 0.5,
    currency: 'SOL',
    currencyColor: '#9945FF',
    usdValue: 100.00,
    description: 'Wallet Deposit',
    date: '2024-12-09T18:45:00',
    status: 'completed',
    txHash: 'ghi789...',
  },
  {
    id: '4',
    type: 'prize',
    amount: 20.00,
    currency: 'USDC',
    currencyColor: '#2775CA',
    usdValue: 20.00,
    description: 'Tournament Win - Puzzle Master',
    date: '2024-12-08T20:15:00',
    status: 'completed',
    txHash: 'jkl012...',
  },
  {
    id: '5',
    type: 'withdrawal',
    amount: -0.02,
    currency: 'ETH',
    currencyColor: '#627EEA',
    usdValue: 50.00,
    description: 'Withdrawal to Wallet',
    date: '2024-12-07T10:00:00',
    status: 'completed',
    txHash: 'mno345...',
  },
  {
    id: '6',
    type: 'refund',
    amount: 5.00,
    currency: 'USDT',
    currencyColor: '#26A17B',
    usdValue: 5.00,
    description: 'Tournament Cancelled - Word Champion',
    date: '2024-12-06T16:30:00',
    status: 'completed',
    txHash: 'pqr678...',
  },
]

// Mock tournament history
const mockTournamentHistory = [
  {
    id: '1',
    gameName: 'Speed Racer X',
    gameIcon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    tournamentName: 'Weekly Championship',
    entryFee: 10,
    prizeWon: 45,
    rank: 1,
    totalPlayers: 50,
    score: 12500,
    date: '2024-12-10T14:30:00',
    status: 'won',
  },
  {
    id: '2',
    gameName: 'Battle Cards',
    gameIcon: 'https://images.unsplash.com/photo-1529480780361-4e1b499781e4?w=100&h=100&fit=crop',
    tournamentName: '1v1 Championship',
    entryFee: 10,
    prizeWon: 0,
    rank: 2,
    totalPlayers: 2,
    score: 850,
    date: '2024-12-10T12:00:00',
    status: 'lost',
  },
  {
    id: '3',
    gameName: 'Puzzle Master',
    gameIcon: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=100&h=100&fit=crop',
    tournamentName: 'Brain Buster',
    entryFee: 5,
    prizeWon: 20,
    rank: 1,
    totalPlayers: 25,
    score: 9800,
    date: '2024-12-08T20:15:00',
    status: 'won',
  },
  {
    id: '4',
    gameName: 'Word Champion',
    gameIcon: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=100&h=100&fit=crop',
    tournamentName: 'Daily Challenge',
    entryFee: 5,
    prizeWon: 0,
    rank: 0,
    totalPlayers: 0,
    score: 0,
    date: '2024-12-06T16:30:00',
    status: 'cancelled',
  },
  {
    id: '5',
    gameName: 'Speed Racer X',
    gameIcon: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop',
    tournamentName: 'Quick Race #98',
    entryFee: 2,
    prizeWon: 4,
    rank: 1,
    totalPlayers: 2,
    score: 11200,
    date: '2024-12-05T19:00:00',
    status: 'won',
  },
]

type TabType = 'overview' | 'transactions' | 'history' | 'settings'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(mockUser.fullWalletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'history', label: 'Match History', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-neon-cyan">
                  <img
                    src={mockUser.avatarUrl}
                    alt={mockUser.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-neon-cyan text-gaming-dark text-xs font-bold">
                  {mockStats.rank}
                </div>
              </div>

              {/* User info */}
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-white mb-1">
                  {mockUser.username}
                </h1>
                <div className="flex items-center gap-2 text-white/50 mb-3">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono text-sm">{mockUser.walletAddress}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:text-neon-cyan transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={`https://etherscan.io/address/${mockUser.fullWalletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:text-neon-cyan transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(mockUser.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gamepad2 className="w-4 h-4" />
                    {mockStats.tournamentsPlayed} tournaments
                  </span>
                </div>
              </div>

              {/* Balance card */}
              <div className="w-full sm:w-auto min-w-[280px]">
                <div className="p-4 rounded-xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20">
                  <div className="text-sm text-white/50 mb-1">Total Balance</div>
                  <div className="font-display text-3xl font-bold text-white mb-3">
                    ${mockUser.totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  
                  {/* Currency breakdown */}
                  <div className="space-y-2 mb-4">
                    {mockUser.balances.map((bal) => (
                      <div key={bal.currency} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ backgroundColor: `${bal.color}20`, color: bal.color }}
                          >
                            {bal.symbol.charAt(0)}
                          </div>
                          <span className="text-white/70">{bal.symbol}</span>
                        </div>
                        <span className="text-white font-mono">{bal.amount}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      Deposit
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1">
                      Withdraw
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
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
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </motion.div>
      </div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-neon-green/10">
              <Trophy className="w-5 h-5 text-neon-green" />
            </div>
            <span className="text-sm text-white/50">Total Earnings</span>
          </div>
          <div className="font-display text-2xl font-bold text-neon-green">
            {formatCurrency(mockStats.totalPrizeWon)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-neon-cyan/10">
              <Target className="w-5 h-5 text-neon-cyan" />
            </div>
            <span className="text-sm text-white/50">Win Rate</span>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {mockStats.winRate}%
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-neon-purple/10">
              <Medal className="w-5 h-5 text-neon-purple" />
            </div>
            <span className="text-sm text-white/50">Tournaments Won</span>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {mockStats.tournamentsWon}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-sm text-white/50">Win Streak</span>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {mockStats.currentStreak}
            <span className="text-sm text-white/30 ml-2">best: {mockStats.bestStreak}</span>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white">Recent Activity</h2>
          <Link to="#" className="text-sm text-neon-cyan hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {mockTournamentHistory.slice(0, 3).map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-gaming-darker"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img
                  src={match.gameIcon}
                  alt={match.gameName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{match.tournamentName}</div>
                <div className="text-sm text-white/50">{match.gameName}</div>
              </div>
              <div className="text-right">
                {match.status === 'won' && (
                  <div className="text-neon-green font-semibold">+{formatCurrency(match.prizeWon)}</div>
                )}
                {match.status === 'lost' && (
                  <div className="text-white/50">#{match.rank} of {match.totalPlayers}</div>
                )}
                {match.status === 'cancelled' && (
                  <Badge variant="warning" size="sm">Cancelled</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Favorite Game */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Favorite Game</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1511882150382-421056c89033?w=100&h=100&fit=crop"
              alt={mockStats.favoriteGame}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-display text-xl font-semibold text-white">{mockStats.favoriteGame}</div>
            <div className="text-sm text-white/50">23 tournaments played</div>
          </div>
          <Link to="/games/1" className="ml-auto">
            <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              View Game
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

function TransactionsTab() {
  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold text-white mb-4">Transaction History</h2>
      
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-gaming-darker">
        <div>
          <div className="text-sm text-white/50 mb-1">Total Deposits</div>
          <div className="font-display text-lg font-semibold text-neon-green">
            +{formatCurrency(mockUser.totalDeposits)}
          </div>
        </div>
        <div>
          <div className="text-sm text-white/50 mb-1">Total Withdrawals</div>
          <div className="font-display text-lg font-semibold text-red-400">
            -{formatCurrency(mockUser.totalWithdrawals)}
          </div>
        </div>
        <div>
          <div className="text-sm text-white/50 mb-1">Net</div>
          <div className="font-display text-lg font-semibold text-white">
            {formatCurrency(mockUser.totalDeposits - mockUser.totalWithdrawals + mockUser.totalEarnings)}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-2">
        {mockTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-4 p-4 rounded-lg bg-gaming-darker hover:bg-gaming-light transition-colors"
          >
            {/* Icon */}
            <div className={cn(
              'p-2 rounded-lg',
              tx.type === 'prize' && 'bg-neon-green/10',
              tx.type === 'deposit' && 'bg-neon-cyan/10',
              tx.type === 'withdrawal' && 'bg-red-500/10',
              tx.type === 'entry' && 'bg-neon-purple/10',
              tx.type === 'refund' && 'bg-yellow-500/10',
            )}>
              {tx.type === 'prize' && <Trophy className="w-5 h-5 text-neon-green" />}
              {tx.type === 'deposit' && <ArrowDownLeft className="w-5 h-5 text-neon-cyan" />}
              {tx.type === 'withdrawal' && <ArrowUpRight className="w-5 h-5 text-red-400" />}
              {tx.type === 'entry' && <Gamepad2 className="w-5 h-5 text-neon-purple" />}
              {tx.type === 'refund' && <History className="w-5 h-5 text-yellow-400" />}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white">{tx.description}</div>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <span>{new Date(tx.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
                <span>•</span>
                <span className="font-mono">{tx.txHash}</span>
              </div>
            </div>

            {/* Amount with currency */}
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: `${tx.currencyColor}20`, color: tx.currencyColor }}
                >
                  {tx.currency.charAt(0)}
                </div>
                <span className={cn(
                  'font-display font-semibold text-lg',
                  tx.amount > 0 ? 'text-neon-green' : 'text-white'
                )}>
                  {tx.amount > 0 ? '+' : ''}{Math.abs(tx.amount)} {tx.currency}
                </span>
              </div>
              <div className="text-xs text-white/40">
                ≈ ${tx.usdValue.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-6 text-center">
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
        >
          View All Transactions
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  )
}

function HistoryTab() {
  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold text-white mb-4">Match History</h2>
      
      <div className="space-y-3">
        {mockTournamentHistory.map((match) => (
          <div
            key={match.id}
            className="p-4 rounded-xl bg-gaming-darker hover:bg-gaming-light transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Game icon */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={match.gameIcon}
                  alt={match.gameName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Match details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{match.tournamentName}</span>
                  {match.status === 'won' && (
                    <Badge variant="success" size="sm">Won</Badge>
                  )}
                  {match.status === 'lost' && (
                    <Badge variant="danger" size="sm">Lost</Badge>
                  )}
                  {match.status === 'cancelled' && (
                    <Badge variant="warning" size="sm">Cancelled</Badge>
                  )}
                </div>
                <div className="text-sm text-white/50 mb-2">{match.gameName}</div>
                
                {match.status !== 'cancelled' && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/40">
                      Rank: <span className="text-white">#{match.rank}</span> of {match.totalPlayers}
                    </span>
                    <span className="text-white/40">
                      Score: <span className="text-white">{match.score.toLocaleString()}</span>
                    </span>
                    <span className="text-white/40">
                      Entry: <span className="text-white">{formatCurrency(match.entryFee)}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Prize/Result */}
              <div className="text-right">
                {match.status === 'won' && (
                  <div className="font-display text-xl font-bold text-neon-green">
                    +{formatCurrency(match.prizeWon)}
                  </div>
                )}
                {match.status === 'lost' && (
                  <div className="font-display text-lg text-white/50">
                    -{formatCurrency(match.entryFee)}
                  </div>
                )}
                {match.status === 'cancelled' && (
                  <div className="text-sm text-white/40">Refunded</div>
                )}
                <div className="text-xs text-white/30 mt-1">
                  {new Date(match.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Account Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gaming-darker">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-white/50" />
              <div>
                <div className="font-medium text-white">Username</div>
                <div className="text-sm text-white/50">{mockUser.username}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gaming-darker">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-white/50" />
              <div>
                <div className="font-medium text-white">Connected Wallet</div>
                <div className="text-sm text-white/50 font-mono">{mockUser.walletAddress}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm">Change</Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Notifications</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gaming-darker">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-white/50" />
              <div>
                <div className="font-medium text-white">Tournament Alerts</div>
                <div className="text-sm text-white/50">Get notified about tournament updates</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gaming-border rounded-full peer peer-checked:bg-neon-cyan peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gaming-darker">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-white/50" />
              <div>
                <div className="font-medium text-white">Prize Notifications</div>
                <div className="text-sm text-white/50">Get notified when you win prizes</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gaming-border rounded-full peer peer-checked:bg-neon-cyan peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Security</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gaming-darker">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-white/50" />
              <div>
                <div className="font-medium text-white">Two-Factor Authentication</div>
                <div className="text-sm text-white/50">Add an extra layer of security</div>
              </div>
            </div>
            <Button variant="secondary" size="sm">Enable</Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-500/20">
        <h2 className="font-display text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        
        <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-red-400" />
            <div>
              <div className="font-medium text-white">Disconnect Wallet</div>
              <div className="text-sm text-white/50">This will log you out of your account</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10">
            Disconnect
          </Button>
        </div>
      </Card>
    </div>
  )
}