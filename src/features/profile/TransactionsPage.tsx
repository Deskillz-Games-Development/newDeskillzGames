import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Trophy,
  Ticket,
  RotateCcw,
  Search,
  Filter,
  Download,
  ChevronDown,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Wallet
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Transaction types
type TransactionType = 'all' | 'deposit' | 'withdrawal' | 'entry_fee' | 'prize' | 'refund'
type TransactionStatus = 'confirmed' | 'pending' | 'failed'

// Mock transactions
const mockTransactions = [
  {
    id: '1',
    type: 'prize' as const,
    amount: 40.5,
    currency: 'USDT',
    status: 'confirmed' as TransactionStatus,
    description: 'Tournament Prize - Speed Racer Championship',
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abcd',
    chain: 'Ethereum',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { tournamentId: '1', place: 1 }
  },
  {
    id: '2',
    type: 'entry_fee' as const,
    amount: -5,
    currency: 'USDT',
    status: 'confirmed' as TransactionStatus,
    description: 'Tournament Entry - Speed Racer Championship',
    txHash: '0xdef456789abc123def456789abc123def456789abc123def456789abc123def4',
    chain: 'Ethereum',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    metadata: { tournamentId: '1' }
  },
  {
    id: '3',
    type: 'deposit' as const,
    amount: 100,
    currency: 'USDT',
    status: 'confirmed' as TransactionStatus,
    description: 'Deposit from external wallet',
    txHash: '0x789abc123def456789abc123def456789abc123def456789abc123def456789a',
    chain: 'Polygon',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    metadata: {}
  },
  {
    id: '4',
    type: 'withdrawal' as const,
    amount: -50,
    currency: 'USDT',
    status: 'pending' as TransactionStatus,
    description: 'Withdrawal to external wallet',
    txHash: '0x456789abc123def456789abc123def456789abc123def456789abc123def4567',
    chain: 'Ethereum',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    metadata: { toAddress: '0x1234...5678' }
  },
  {
    id: '5',
    type: 'prize' as const,
    amount: 22.5,
    currency: 'USDT',
    status: 'confirmed' as TransactionStatus,
    description: 'Tournament Prize - Puzzle Masters Weekly',
    txHash: '0x123def456789abc123def456789abc123def456789abc123def456789abc123d',
    chain: 'Ethereum',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { tournamentId: '2', place: 2 }
  },
  {
    id: '6',
    type: 'entry_fee' as const,
    amount: -10,
    currency: 'USDT',
    status: 'confirmed' as TransactionStatus,
    description: 'Tournament Entry - Puzzle Masters Weekly',
    txHash: '0xabc789def123456789abc123def456789abc123def456789abc123def456789a',
    chain: 'Ethereum',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000).toISOString(),
    metadata: { tournamentId: '2' }
  },
  {
    id: '7',
    type: 'refund' as const,
    amount: 5,
    currency: 'USDT',
    status: 'confirmed' as TransactionStatus,
    description: 'Tournament Cancelled - Battle Royale #45',
    txHash: '0xdef123456789abc123def456789abc123def456789abc123def456789abc1234',
    chain: 'Ethereum',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { tournamentId: '3' }
  },
  {
    id: '8',
    type: 'deposit' as const,
    amount: 200,
    currency: 'USDT',
    status: 'confirmed' as TransactionStatus,
    description: 'Deposit from external wallet',
    txHash: '0x789def123456abc789def123456abc789def123456abc789def123456abc789d',
    chain: 'BSC',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {}
  },
  {
    id: '9',
    type: 'entry_fee' as const,
    amount: -25,
    currency: 'USDT',
    status: 'failed' as TransactionStatus,
    description: 'Tournament Entry - High Stakes Showdown',
    txHash: '0x456abc789def123456abc789def123456abc789def123456abc789def123456a',
    chain: 'Ethereum',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { tournamentId: '4', error: 'Insufficient balance' }
  },
  {
    id: '10',
    type: 'prize' as const,
    amount: 112.5,
    currency: 'USDT',
    status: 'confirmed' as TransactionStatus,
    description: 'Tournament Prize - Monthly Championship',
    txHash: '0xabc456def789123abc456def789123abc456def789123abc456def789123abc4',
    chain: 'Ethereum',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { tournamentId: '5', place: 1 }
  },
]

// Transaction type config
const typeConfig: Record<TransactionType, { label: string; icon: typeof Trophy; color: string; bgColor: string }> = {
  all: { label: 'All', icon: Wallet, color: 'text-white', bgColor: 'bg-white/20' },
  deposit: { label: 'Deposit', icon: ArrowDownLeft, color: 'text-neon-green', bgColor: 'bg-neon-green/20' },
  withdrawal: { label: 'Withdrawal', icon: ArrowUpRight, color: 'text-neon-purple', bgColor: 'bg-neon-purple/20' },
  entry_fee: { label: 'Entry Fee', icon: Ticket, color: 'text-neon-cyan', bgColor: 'bg-neon-cyan/20' },
  prize: { label: 'Prize', icon: Trophy, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
  refund: { label: 'Refund', icon: RotateCcw, color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
}

// Status config
const statusConfig: Record<TransactionStatus, { label: string; icon: typeof CheckCircle2; color: string; bgColor: string }> = {
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-neon-green', bgColor: 'bg-neon-green/20' },
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-neon-red', bgColor: 'bg-neon-red/20' },
}

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState<TransactionType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<typeof mockTransactions[0] | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  // Filter transactions
  const filteredTransactions = mockTransactions.filter(tx => {
    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) return false
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!tx.description.toLowerCase().includes(query) && 
          !tx.txHash.toLowerCase().includes(query)) {
        return false
      }
    }
    
    // Date filter
    if (dateRange !== 'all') {
      const now = Date.now()
      const txDate = new Date(tx.createdAt).getTime()
      const days = parseInt(dateRange)
      if (now - txDate > days * 24 * 60 * 60 * 1000) return false
    }
    
    return true
  })

  // Calculate summary stats
  const stats = {
    totalDeposits: mockTransactions
      .filter(tx => tx.type === 'deposit' && tx.status === 'confirmed')
      .reduce((sum, tx) => sum + tx.amount, 0),
    totalWithdrawals: Math.abs(mockTransactions
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'confirmed')
      .reduce((sum, tx) => sum + tx.amount, 0)),
    totalPrizes: mockTransactions
      .filter(tx => tx.type === 'prize' && tx.status === 'confirmed')
      .reduce((sum, tx) => sum + tx.amount, 0),
    totalEntryFees: Math.abs(mockTransactions
      .filter(tx => tx.type === 'entry_fee' && tx.status === 'confirmed')
      .reduce((sum, tx) => sum + tx.amount, 0)),
  }

  // Copy transaction hash
  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60 * 1000) return 'Just now'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} min ago`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} hours ago`
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)} days ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-white/50">View and manage all your transactions</p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-green/20 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <div className="text-sm text-white/50">Total Deposits</div>
                <div className="font-display text-xl font-bold text-neon-green">
                  +{stats.totalDeposits.toFixed(2)} USDT
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <div className="text-sm text-white/50">Total Withdrawals</div>
                <div className="font-display text-xl font-bold text-neon-purple">
                  -{stats.totalWithdrawals.toFixed(2)} USDT
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm text-white/50">Prizes Won</div>
                <div className="font-display text-xl font-bold text-yellow-400">
                  +{stats.totalPrizes.toFixed(2)} USDT
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <div className="text-sm text-white/50">Entry Fees</div>
                <div className="font-display text-xl font-bold text-neon-cyan">
                  -{stats.totalEntryFees.toFixed(2)} USDT
                </div>
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
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gaming-border bg-gaming-darker text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gaming-border bg-gaming-darker text-white hover:border-white/30 transition-colors"
                >
                  <Filter className="w-5 h-5 text-white/50" />
                  <span>{typeConfig[filterType].label}</span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-white/50 transition-transform',
                    showFilters && 'rotate-180'
                  )} />
                </button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-gaming-dark border border-gaming-border rounded-xl shadow-xl z-10 overflow-hidden"
                    >
                      {(Object.keys(typeConfig) as TransactionType[]).map((type) => {
                        const config = typeConfig[type]
                        const Icon = config.icon
                        return (
                          <button
                            key={type}
                            onClick={() => {
                              setFilterType(type)
                              setShowFilters(false)
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 hover:bg-gaming-light transition-colors',
                              filterType === type && 'bg-gaming-light'
                            )}
                          >
                            <Icon className={cn('w-4 h-4', config.color)} />
                            <span className="text-white">{config.label}</span>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Date Range */}
              <div className="flex gap-2">
                {(['all', '7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={cn(
                      'px-4 py-3 rounded-xl border transition-colors',
                      dateRange === range
                        ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                        : 'border-gaming-border bg-gaming-darker text-white/70 hover:text-white hover:border-white/30'
                    )}
                  >
                    {range === 'all' ? 'All Time' : range}
                  </button>
                ))}
              </div>

              {/* Export */}
              <Button
                variant="ghost"
                leftIcon={<Download className="w-4 h-4" />}
                className="shrink-0"
              >
                Export
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            {filteredTransactions.length > 0 ? (
              <div className="divide-y divide-gaming-border">
                {filteredTransactions.map((tx, index) => {
                  const typeConf = typeConfig[tx.type]
                  const statusConf = statusConfig[tx.status]
                  const TypeIcon = typeConf.icon
                  const StatusIcon = statusConf.icon

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedTransaction(tx)}
                      className="flex items-center gap-4 p-4 hover:bg-gaming-light/50 cursor-pointer transition-colors"
                    >
                      {/* Icon */}
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                        typeConf.bgColor
                      )}>
                        <TypeIcon className={cn('w-6 h-6', typeConf.color)} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white truncate">
                            {tx.description}
                          </span>
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium shrink-0',
                            statusConf.bgColor,
                            statusConf.color
                          )}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConf.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/50">
                          <span>{formatDate(tx.createdAt)}</span>
                          <span>•</span>
                          <span>{tx.chain}</span>
                          <span>•</span>
                          <span className="font-mono">
                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <div className={cn(
                          'font-display text-lg font-bold',
                          tx.amount > 0 ? 'text-neon-green' : 'text-white'
                        )}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gaming-light flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="font-semibold text-white mb-2">No transactions found</h3>
                <p className="text-white/50">
                  {searchQuery 
                    ? 'Try adjusting your search or filters'
                    : 'Your transactions will appear here'}
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Pagination info */}
        {filteredTransactions.length > 0 && (
          <div className="mt-4 text-center text-sm text-white/50">
            Showing {filteredTransactions.length} of {mockTransactions.length} transactions
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gaming-dark border border-gaming-border rounded-2xl p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 rounded-lg hover:bg-gaming-light text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Transaction Info */}
              {(() => {
                const tx = selectedTransaction
                const typeConf = typeConfig[tx.type]
                const statusConf = statusConfig[tx.status]
                const TypeIcon = typeConf.icon
                const StatusIcon = statusConf.icon

                return (
                  <div className="space-y-6">
                    {/* Amount */}
                    <div className="text-center pb-6 border-b border-gaming-border">
                      <div className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
                        typeConf.bgColor
                      )}>
                        <TypeIcon className={cn('w-8 h-8', typeConf.color)} />
                      </div>
                      <div className={cn(
                        'font-display text-3xl font-bold mb-2',
                        tx.amount > 0 ? 'text-neon-green' : 'text-white'
                      )}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
                      </div>
                      <div className="text-white/50">{tx.description}</div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/50">Status</span>
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium',
                          statusConf.bgColor,
                          statusConf.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Type</span>
                        <span className={cn('font-medium', typeConf.color)}>
                          {typeConf.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Network</span>
                        <span className="text-white">{tx.chain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Date</span>
                        <span className="text-white">
                          {new Date(tx.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Transaction Hash */}
                      <div>
                        <div className="text-white/50 mb-2">Transaction Hash</div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-gaming-darker rounded-lg text-sm text-white/70 font-mono truncate">
                            {tx.txHash}
                          </code>
                          <button
                            onClick={() => copyHash(tx.txHash)}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              copiedHash === tx.txHash
                                ? 'bg-neon-green/20 text-neon-green'
                                : 'bg-gaming-light text-white/50 hover:text-white'
                            )}
                          >
                            {copiedHash === tx.txHash ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={`https://etherscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-gaming-light text-white/50 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      {/* Metadata */}
                      {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                        <div>
                          <div className="text-white/50 mb-2">Additional Info</div>
                          <div className="p-3 bg-gaming-darker rounded-lg space-y-2">
                            {tx.metadata.place && (
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Place</span>
                                <span className="text-yellow-400 font-medium">
                                  {tx.metadata.place === 1 ? '🥇 1st' :
                                   tx.metadata.place === 2 ? '🥈 2nd' :
                                   tx.metadata.place === 3 ? '🥉 3rd' :
                                   `${tx.metadata.place}th`}
                                </span>
                              </div>
                            )}
                            {tx.metadata.tournamentId && (
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Tournament ID</span>
                                <span className="text-white font-mono">#{tx.metadata.tournamentId}</span>
                              </div>
                            )}
                            {tx.metadata.toAddress && (
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">To Address</span>
                                <span className="text-white font-mono">{tx.metadata.toAddress}</span>
                              </div>
                            )}
                            {tx.metadata.error && (
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Error</span>
                                <span className="text-neon-red">{tx.metadata.error}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gaming-border">
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setSelectedTransaction(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}