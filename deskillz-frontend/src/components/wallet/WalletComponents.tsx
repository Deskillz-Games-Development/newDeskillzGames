import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  Wallet, 
  ChevronDown, 
  ExternalLink, 
  Copy, 
  LogOut,
  Check,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { cn } from '@/lib/utils'

// Custom styled connect button using RainbowKit's render prop pattern
export function WalletConnectButton({ className }: { className?: string }) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className={className}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-neon-cyan text-gaming-dark font-semibold rounded-xl hover:bg-neon-cyan/90 transition-all hover:shadow-[0_0_20px_rgba(0,245,212,0.3)]"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-all border border-red-500/30"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Wrong Network
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  {/* Chain selector */}
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 px-3 py-2.5 bg-gaming-light border border-gaming-border rounded-xl hover:border-neon-cyan/30 transition-all"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain'}
                        src={chain.iconUrl}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="text-white text-sm font-medium hidden sm:inline">
                      {chain.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </button>

                  {/* Account button */}
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 px-3 py-2.5 bg-gaming-light border border-gaming-border rounded-xl hover:border-neon-cyan/30 transition-all"
                  >
                    {account.ensAvatar ? (
                      <img
                        src={account.ensAvatar}
                        alt="Avatar"
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple" />
                    )}
                    <span className="text-white text-sm font-medium">
                      {account.displayName}
                    </span>
                    <span className="text-neon-green text-sm font-medium hidden sm:inline">
                      {account.displayBalance}
                    </span>
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

// Compact connect button for mobile/smaller spaces
export function CompactWalletButton() {
  const { isConnected, isConnecting, connect, formattedAddress, openAccountModal } = useWallet()

  if (isConnecting) {
    return (
      <button className="p-2.5 bg-gaming-light border border-gaming-border rounded-xl" disabled>
        <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />
      </button>
    )
  }

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="p-2.5 bg-neon-cyan text-gaming-dark rounded-xl hover:bg-neon-cyan/90 transition-all"
      >
        <Wallet className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={openAccountModal}
      className="flex items-center gap-2 px-3 py-2 bg-gaming-light border border-gaming-border rounded-xl hover:border-neon-cyan/30 transition-all"
    >
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple" />
      <span className="text-white text-sm font-medium">{formattedAddress}</span>
    </button>
  )
}

// Wallet card for profile page
export function WalletCard() {
  const { 
    address, 
    isConnected, 
    currentChain, 
    formattedBalance,
    explorerAddressUrl,
    connect,
    disconnect,
    openChainModal
  } = useWallet()
  
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  if (!isConnected) {
    return (
      <div className="p-6 bg-gaming-light border border-gaming-border rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gaming-darker flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-white/50 mb-4">
            Connect your wallet to deposit funds and enter tournaments
          </p>
          <button
            onClick={connect}
            className="w-full py-3 bg-neon-cyan text-gaming-dark font-semibold rounded-xl hover:bg-neon-cyan/90 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gaming-light border border-gaming-border rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Connected Wallet</h3>
        <button
          onClick={openChainModal}
          className="flex items-center gap-1.5 px-2 py-1 bg-gaming-darker rounded-lg text-xs text-white/70 hover:text-white transition-colors"
        >
          {currentChain && (
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: currentChain.color }}
            />
          )}
          {currentChain?.name || 'Unknown'}
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Address */}
      <div className="flex items-center gap-3 p-3 bg-gaming-darker rounded-xl mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white/50">Address</div>
          <div className="text-white font-mono truncate">{address}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyAddress}
            className="p-2 hover:bg-gaming-light rounded-lg transition-colors"
            title="Copy address"
          >
            {copied ? (
              <Check className="w-4 h-4 text-neon-green" />
            ) : (
              <Copy className="w-4 h-4 text-white/50 hover:text-white" />
            )}
          </button>
          {explorerAddressUrl && (
            <a
              href={explorerAddressUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gaming-light rounded-lg transition-colors"
              title="View on explorer"
            >
              <ExternalLink className="w-4 h-4 text-white/50 hover:text-white" />
            </a>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="p-3 bg-gaming-darker rounded-xl mb-4">
        <div className="text-sm text-white/50 mb-1">Native Balance</div>
        <div className="text-2xl font-display font-bold text-white">
          {formattedBalance || '0.0000 ETH'}
        </div>
        {/* Could add USD value here */}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button 
          onClick={handleDisconnect}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </div>
  )
}

// Network status indicator
export function NetworkIndicator() {
  const { isConnected, currentChain, openChainModal } = useWallet()

  if (!isConnected || !currentChain) return null

  return (
    <button
      onClick={openChainModal}
      className="flex items-center gap-2 px-2 py-1 bg-gaming-darker rounded-lg text-xs hover:bg-gaming-light transition-colors"
    >
      <span 
        className="w-2 h-2 rounded-full animate-pulse" 
        style={{ backgroundColor: currentChain.color }}
      />
      <span className="text-white/70">{currentChain.name}</span>
    </button>
  )
}

// Connection status badge
export function ConnectionStatus() {
  const { isConnected, isConnecting } = useWallet()

  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
      isConnected 
        ? 'bg-neon-green/10 text-neon-green'
        : isConnecting
          ? 'bg-yellow-500/10 text-yellow-400'
          : 'bg-white/5 text-white/50'
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        isConnected 
          ? 'bg-neon-green animate-pulse'
          : isConnecting
            ? 'bg-yellow-400 animate-pulse'
            : 'bg-white/30'
      )} />
      {isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}
    </div>
  )
}