import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Search } from 'lucide-react'
import { currencies, Currency, getGroupedCurrencies, type CurrencyId } from '@/lib/currencies'
import { cn } from '@/lib/utils'

// Currency icon component using emoji/text fallbacks
function CurrencyIcon({ currency, size = 'md' }: { currency: Currency; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  // Map currency symbols to display
  const iconMap: Record<string, string> = {
    ETH: 'Ξ',
    BTC: '₿',
    BNB: 'BNB',
    SOL: '◎',
    XRP: 'XRP',
    USDT: '₮',
    USDC: '$',
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold',
        sizeClasses[size]
      )}
      style={{ backgroundColor: `${currency.color}20`, color: currency.color }}
    >
      {iconMap[currency.symbol] || currency.symbol.charAt(0)}
    </div>
  )
}

interface CurrencySelectorProps {
  value: CurrencyId
  onChange: (currency: CurrencyId) => void
  label?: string
  showChain?: boolean
  disabled?: boolean
  className?: string
}

export default function CurrencySelector({
  value,
  onChange,
  label,
  showChain = true,
  disabled = false,
  className,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedCurrency = currencies.find(c => c.id === value)
  const grouped = getGroupedCurrencies()

  const filteredNative = grouped.native.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStablecoins = grouped.stablecoins.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.chainName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (currencyId: CurrencyId) => {
    onChange(currencyId)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-white mb-2">{label}</label>
      )}

      {/* Selected currency button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3',
          'bg-gaming-darker border border-gaming-border rounded-xl',
          'text-left transition-colors',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-neon-cyan/50 cursor-pointer',
          isOpen && 'border-neon-cyan/50'
        )}
      >
        {selectedCurrency ? (
          <div className="flex items-center gap-3">
            <CurrencyIcon currency={selectedCurrency} />
            <div>
              <div className="font-semibold text-white">{selectedCurrency.symbol}</div>
              {showChain && (
                <div className="text-xs text-white/50">{selectedCurrency.chainName}</div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-white/50">Select currency</span>
        )}
        <ChevronDown
          className={cn(
            'w-5 h-5 text-white/50 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 bg-gaming-light border border-gaming-border rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-gaming-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search currencies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gaming-darker border border-gaming-border rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
                  />
                </div>
              </div>

              {/* Currency list */}
              <div className="max-h-80 overflow-y-auto">
                {/* Native tokens */}
                {filteredNative.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider bg-gaming-darker">
                      Native Tokens
                    </div>
                    {filteredNative.map((currency) => (
                      <CurrencyOption
                        key={currency.id}
                        currency={currency}
                        isSelected={currency.id === value}
                        onClick={() => handleSelect(currency.id)}
                        showChain={showChain}
                      />
                    ))}
                  </div>
                )}

                {/* Stablecoins */}
                {filteredStablecoins.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider bg-gaming-darker">
                      Stablecoins
                    </div>
                    {filteredStablecoins.map((currency) => (
                      <CurrencyOption
                        key={currency.id}
                        currency={currency}
                        isSelected={currency.id === value}
                        onClick={() => handleSelect(currency.id)}
                        showChain={showChain}
                      />
                    ))}
                  </div>
                )}

                {/* No results */}
                {filteredNative.length === 0 && filteredStablecoins.length === 0 && (
                  <div className="px-4 py-8 text-center text-white/50">
                    No currencies found
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function CurrencyOption({
  currency,
  isSelected,
  onClick,
  showChain,
}: {
  currency: Currency
  isSelected: boolean
  onClick: () => void
  showChain: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-4 py-3',
        'text-left transition-colors',
        isSelected ? 'bg-neon-cyan/10' : 'hover:bg-white/5'
      )}
    >
      <div className="flex items-center gap-3">
        <CurrencyIcon currency={currency} />
        <div>
          <div className="font-semibold text-white">
            {currency.symbol}
            {currency.isStablecoin && showChain && (
              <span className="ml-2 text-xs font-normal text-white/40">
                ({currency.chainName})
              </span>
            )}
          </div>
          <div className="text-xs text-white/50">{currency.name}</div>
        </div>
      </div>
      {isSelected && <Check className="w-5 h-5 text-neon-cyan" />}
    </button>
  )
}

// Compact version for inline use
export function CurrencyBadge({ currencyId }: { currencyId: CurrencyId }) {
  const currency = currencies.find(c => c.id === currencyId)
  if (!currency) return null

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gaming-darker border border-gaming-border">
      <CurrencyIcon currency={currency} size="sm" />
      <span className="text-sm font-medium text-white">{currency.symbol}</span>
    </div>
  )
}

// Multi-currency display for showing accepted currencies
export function AcceptedCurrencies({ compact = false }: { compact?: boolean }) {
  const grouped = getGroupedCurrencies()
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {grouped.native.map((currency) => (
          <div
            key={currency.id}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: `${currency.color}20`, color: currency.color }}
            title={currency.name}
          >
            {currency.symbol.charAt(0)}
          </div>
        ))}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#26A17B]/20 text-[#26A17B]" title="USDT (All chains)">
          ₮
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#2775CA]/20 text-[#2775CA]" title="USDC (All chains)">
          $
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Native Tokens</div>
        <div className="flex flex-wrap gap-2">
          {grouped.native.map((currency) => (
            <div
              key={currency.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gaming-darker border border-gaming-border"
            >
              <CurrencyIcon currency={currency} size="sm" />
              <span className="text-sm font-medium text-white">{currency.symbol}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Stablecoins (All Chains)</div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gaming-darker border border-gaming-border">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-[#26A17B]/20 text-[#26A17B]">₮</div>
            <span className="text-sm font-medium text-white">USDT</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gaming-darker border border-gaming-border">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-[#2775CA]/20 text-[#2775CA]">$</div>
            <span className="text-sm font-medium text-white">USDC</span>
          </div>
        </div>
      </div>
    </div>
  )
}