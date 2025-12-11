import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gamepad2, 
  Trophy, 
  Medal,
  User, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  Settings,
  History,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWallet } from '@/hooks/useWallet'
import { WalletConnectButton, NetworkIndicator } from '@/components/wallet/WalletComponents'

const navLinks = [
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Tournaments', href: '/tournaments', icon: Trophy },
  { name: 'Leaderboards', href: '/leaderboards', icon: Medal },
]

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const { 
    isConnected, 
    address,
    formattedAddress, 
    formattedBalance,
    currentChain,
    explorerAddressUrl,
    disconnect 
  } = useWallet()

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gaming-dark/80 backdrop-blur-xl border-b border-gaming-border/50" />
      
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-bold tracking-wider text-white">
                DESKILLZ
              </span>
              <span className="font-display text-xl font-bold tracking-wider text-neon-cyan">
                .GAMES
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    'relative px-4 py-2 font-display text-sm font-medium uppercase tracking-wider',
                    'transition-colors duration-200',
                    isActive ? 'text-neon-cyan' : 'text-white/70 hover:text-white'
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </span>
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-neon-cyan/10 rounded-lg border border-neon-cyan/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                {/* Network indicator */}
                <div className="hidden sm:block">
                  <NetworkIndicator />
                </div>

                {/* Wallet balance */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gaming-light/50 rounded-lg border border-gaming-border">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="font-mono text-sm text-neon-green">
                    {formattedBalance}
                  </span>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:inline text-sm text-white font-medium">
                      {formattedAddress}
                    </span>
                    <ChevronDown className={cn(
                      'w-4 h-4 text-white/50 transition-transform',
                      profileDropdownOpen && 'rotate-180'
                    )} />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setProfileDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-72 py-2 bg-gaming-light border border-gaming-border rounded-xl shadow-xl z-50"
                        >
                          {/* Wallet info */}
                          <div className="px-4 py-3 border-b border-gaming-border">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-white/50">Connected to {currentChain?.name}</p>
                              <span 
                                className="w-2 h-2 rounded-full animate-pulse" 
                                style={{ backgroundColor: currentChain?.color || '#00F5D4' }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-sm text-neon-cyan flex-1 truncate">
                                {address}
                              </p>
                              <button
                                onClick={copyAddress}
                                className="p-1 hover:bg-gaming-darker rounded transition-colors"
                                title="Copy address"
                              >
                                {copied ? (
                                  <Check className="w-3.5 h-3.5 text-neon-green" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-white/50 hover:text-white" />
                                )}
                              </button>
                              {explorerAddressUrl && (
                                <a
                                  href={explorerAddressUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-gaming-darker rounded transition-colors"
                                  title="View on explorer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-white/50 hover:text-white" />
                                </a>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gaming-border/50">
                              <p className="text-xs text-white/50">Balance</p>
                              <p className="font-display text-lg font-bold text-white">
                                {formattedBalance}
                              </p>
                            </div>
                          </div>

                          {/* Menu links */}
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link
                            to="/profile/transactions"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5"
                          >
                            <History className="w-4 h-4" />
                            Transactions
                          </Link>
                          <Link
                            to="/profile/settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          
                          {/* Disconnect */}
                          <div className="border-t border-gaming-border mt-2 pt-2">
                            <button
                              onClick={() => {
                                disconnect()
                                setProfileDropdownOpen(false)
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5"
                            >
                              <LogOut className="w-4 h-4" />
                              Disconnect Wallet
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Connect wallet button (desktop) */
              <div className="hidden sm:block">
                <WalletConnectButton />
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg font-display text-sm uppercase tracking-wider',
                      location.pathname === link.href
                        ? 'bg-neon-cyan/10 text-neon-cyan'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                ))}
                
                {/* Mobile wallet section */}
                <div className="pt-4 mt-4 border-t border-gaming-border">
                  {isConnected ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                          <span className="text-sm text-white/50">Connected</span>
                        </div>
                        <span className="font-mono text-sm text-neon-cyan">{formattedAddress}</span>
                      </div>
                      <div className="px-4">
                        <div className="p-3 bg-gaming-darker rounded-lg">
                          <p className="text-xs text-white/50 mb-1">Balance</p>
                          <p className="font-display text-lg font-bold text-white">{formattedBalance}</p>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5"
                      >
                        <User className="w-5 h-5" />
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          disconnect()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-white/5"
                      >
                        <LogOut className="w-5 h-5" />
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div className="px-4">
                      <WalletConnectButton className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}