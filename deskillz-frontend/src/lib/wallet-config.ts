import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { createConfig } from 'wagmi'
import { 
  mainnet, 
  polygon, 
  bsc, 
  arbitrum, 
  optimism,
  base,
  sepolia 
} from 'wagmi/chains'
import { http } from 'wagmi'

// Import wallet connectors
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
  trustWallet,
  bitgetWallet,
  phantomWallet,
} from '@rainbow-me/rainbowkit/wallets'

// Supported chains for the platform
export const supportedChains = [
  mainnet,
  polygon,
  bsc,
  arbitrum,
  optimism,
  base,
  sepolia, // Testnet for development
] as const

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'
console.log('WalletConnect Project ID:', projectId)  // ← Add this line
// Configure wallet groups
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        rainbowWallet,
      ],
    },
    {
      groupName: 'More',
      wallets: [
        trustWallet,
        bitgetWallet,
        phantomWallet,
      ],
    },
  ],
  {
    appName: 'Deskillz.Games',
    projectId,
  }
)

// Create wagmi config with custom wallets
export const wagmiConfig = createConfig({
  connectors,
  chains: supportedChains,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
})

// Chain metadata for display
export const chainMeta: Record<number, { 
  name: string
  icon: string
  color: string
  explorerUrl: string
  nativeCurrency: string
}> = {
  [mainnet.id]: {
    name: 'Ethereum',
    icon: 'Ξ',
    color: '#627EEA',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: 'ETH',
  },
  [polygon.id]: {
    name: 'Polygon',
    icon: '⬡',
    color: '#8247E5',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: 'MATIC',
  },
  [bsc.id]: {
    name: 'BNB Chain',
    icon: '◆',
    color: '#F0B90B',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: 'BNB',
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    icon: '◈',
    color: '#28A0F0',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: 'ETH',
  },
  [optimism.id]: {
    name: 'Optimism',
    icon: '⊙',
    color: '#FF0420',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: 'ETH',
  },
  [base.id]: {
    name: 'Base',
    icon: '◎',
    color: '#0052FF',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: 'ETH',
  },
  [sepolia.id]: {
    name: 'Sepolia',
    icon: 'Ξ',
    color: '#627EEA',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: 'ETH',
  },
}

// Token addresses for supported currencies on each chain
export const tokenAddresses: Record<number, Record<string, `0x${string}`>> = {
  [mainnet.id]: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  [polygon.id]: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
  [bsc.id]: {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  [arbitrum.id]: {
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  [optimism.id]: {
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  },
  [base.id]: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
}

// ERC20 ABI for token balance queries
export const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const

// Format address for display
export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// Get explorer URL for address
export function getExplorerAddressUrl(chainId: number, address: string): string {
  const meta = chainMeta[chainId]
  return meta ? `${meta.explorerUrl}/address/${address}` : '#'
}

// Get explorer URL for transaction
export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const meta = chainMeta[chainId]
  return meta ? `${meta.explorerUrl}/tx/${txHash}` : '#'
}