// Supported cryptocurrencies for the platform

export type CurrencyId = 
  | 'eth' 
  | 'btc' 
  | 'bnb' 
  | 'sol' 
  | 'xrp'
  | 'usdt-eth' 
  | 'usdt-tron' 
  | 'usdt-bsc' 
  | 'usdt-sol'
  | 'usdc-eth' 
  | 'usdc-sol' 
  | 'usdc-bsc'

export type ChainId = 'ethereum' | 'bitcoin' | 'bsc' | 'solana' | 'tron' | 'ripple'

export interface Currency {
  id: CurrencyId
  symbol: string
  name: string
  chain: ChainId
  chainName: string
  decimals: number
  icon: string
  color: string
  isStablecoin: boolean
}

export interface Chain {
  id: ChainId
  name: string
  icon: string
  color: string
  explorerUrl: string
}

// Supported chains
export const chains: Record<ChainId, Chain> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '/chains/ethereum.svg',
    color: '#627EEA',
    explorerUrl: 'https://etherscan.io',
  },
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    icon: '/chains/bitcoin.svg',
    color: '#F7931A',
    explorerUrl: 'https://blockchain.com',
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Chain',
    icon: '/chains/bnb.svg',
    color: '#F0B90B',
    explorerUrl: 'https://bscscan.com',
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    icon: '/chains/solana.svg',
    color: '#9945FF',
    explorerUrl: 'https://solscan.io',
  },
  tron: {
    id: 'tron',
    name: 'TRON',
    icon: '/chains/tron.svg',
    color: '#FF0013',
    explorerUrl: 'https://tronscan.org',
  },
  ripple: {
    id: 'ripple',
    name: 'XRP Ledger',
    icon: '/chains/xrp.svg',
    color: '#23292F',
    explorerUrl: 'https://xrpscan.com',
  },
}

// Supported currencies
export const currencies: Currency[] = [
  // Native tokens
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    chain: 'ethereum',
    chainName: 'Ethereum',
    decimals: 18,
    icon: '/tokens/eth.svg',
    color: '#627EEA',
    isStablecoin: false,
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    chain: 'bitcoin',
    chainName: 'Bitcoin',
    decimals: 8,
    icon: '/tokens/btc.svg',
    color: '#F7931A',
    isStablecoin: false,
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB',
    chain: 'bsc',
    chainName: 'BNB Chain',
    decimals: 18,
    icon: '/tokens/bnb.svg',
    color: '#F0B90B',
    isStablecoin: false,
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    chain: 'solana',
    chainName: 'Solana',
    decimals: 9,
    icon: '/tokens/sol.svg',
    color: '#9945FF',
    isStablecoin: false,
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP',
    chain: 'ripple',
    chainName: 'XRP Ledger',
    decimals: 6,
    icon: '/tokens/xrp.svg',
    color: '#23292F',
    isStablecoin: false,
  },
  
  // USDT on different chains
  {
    id: 'usdt-eth',
    symbol: 'USDT',
    name: 'Tether USD',
    chain: 'ethereum',
    chainName: 'Ethereum',
    decimals: 6,
    icon: '/tokens/usdt.svg',
    color: '#26A17B',
    isStablecoin: true,
  },
  {
    id: 'usdt-tron',
    symbol: 'USDT',
    name: 'Tether USD',
    chain: 'tron',
    chainName: 'TRON',
    decimals: 6,
    icon: '/tokens/usdt.svg',
    color: '#26A17B',
    isStablecoin: true,
  },
  {
    id: 'usdt-bsc',
    symbol: 'USDT',
    name: 'Tether USD',
    chain: 'bsc',
    chainName: 'BNB Chain',
    decimals: 18,
    icon: '/tokens/usdt.svg',
    color: '#26A17B',
    isStablecoin: true,
  },
  {
    id: 'usdt-sol',
    symbol: 'USDT',
    name: 'Tether USD',
    chain: 'solana',
    chainName: 'Solana',
    decimals: 6,
    icon: '/tokens/usdt.svg',
    color: '#26A17B',
    isStablecoin: true,
  },
  
  // USDC on different chains
  {
    id: 'usdc-eth',
    symbol: 'USDC',
    name: 'USD Coin',
    chain: 'ethereum',
    chainName: 'Ethereum',
    decimals: 6,
    icon: '/tokens/usdc.svg',
    color: '#2775CA',
    isStablecoin: true,
  },
  {
    id: 'usdc-sol',
    symbol: 'USDC',
    name: 'USD Coin',
    chain: 'solana',
    chainName: 'Solana',
    decimals: 6,
    icon: '/tokens/usdc.svg',
    color: '#2775CA',
    isStablecoin: true,
  },
  {
    id: 'usdc-bsc',
    symbol: 'USDC',
    name: 'USD Coin',
    chain: 'bsc',
    chainName: 'BNB Chain',
    decimals: 18,
    icon: '/tokens/usdc.svg',
    color: '#2775CA',
    isStablecoin: true,
  },
]

// Get currency by ID
export function getCurrency(id: CurrencyId): Currency | undefined {
  return currencies.find(c => c.id === id)
}

// Get all currencies for a chain
export function getCurrenciesByChain(chainId: ChainId): Currency[] {
  return currencies.filter(c => c.chain === chainId)
}

// Get all stablecoins
export function getStablecoins(): Currency[] {
  return currencies.filter(c => c.isStablecoin)
}

// Get all native tokens
export function getNativeTokens(): Currency[] {
  return currencies.filter(c => !c.isStablecoin)
}

// Group currencies by type for display
export function getGroupedCurrencies() {
  return {
    native: getNativeTokens(),
    stablecoins: getStablecoins(),
  }
}

// Format currency amount with symbol
export function formatCryptoAmount(amount: number, currencyId: CurrencyId): string {
  const currency = getCurrency(currencyId)
  if (!currency) return `${amount}`
  
  // For stablecoins, show 2 decimal places
  // For crypto, show up to 6 significant digits
  const decimals = currency.isStablecoin ? 2 : 6
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: currency.isStablecoin ? 2 : 0,
    maximumFractionDigits: decimals,
  })
  
  return `${formatted} ${currency.symbol}`
}

// Default platform currency (for display purposes, prizes shown in USD value)
export const defaultCurrency: CurrencyId = 'usdt-eth'

// Popular/featured currencies for quick selection
export const featuredCurrencies: CurrencyId[] = [
  'eth',
  'btc',
  'sol',
  'usdt-eth',
  'usdc-eth',
]