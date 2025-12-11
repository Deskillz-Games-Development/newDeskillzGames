import { useAccount, useBalance, useChainId, useDisconnect, useSwitchChain } from 'wagmi'
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit'
import { formatUnits } from 'viem'
import { chainMeta, formatAddress, getExplorerAddressUrl, getExplorerTxUrl } from '@/lib/wallet-config'

// Main wallet hook combining common operations
export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting, connector } = useAccount()
  const chainId = useChainId()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()

  // Get native balance
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
  })

  // Current chain info
  const currentChain = chainId ? chainMeta[chainId] : null

  // Formatted values
  const formattedAddress = address ? formatAddress(address) : null
  const formattedBalance = balanceData 
    ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} ${balanceData.symbol}`
    : null
  const balanceValue = balanceData 
    ? parseFloat(formatUnits(balanceData.value, balanceData.decimals))
    : 0

  // Explorer URLs
  const explorerAddressUrl = address && chainId 
    ? getExplorerAddressUrl(chainId, address) 
    : null

  return {
    // Connection state
    address,
    isConnected,
    isConnecting: isConnecting || isReconnecting,
    connector,
    
    // Chain state
    chainId,
    currentChain,
    isSwitchingChain,
    
    // Balance
    balance: balanceData,
    balanceValue,
    formattedBalance,
    isBalanceLoading,
    
    // Formatted values
    formattedAddress,
    explorerAddressUrl,
    
    // Actions
    connect: openConnectModal,
    disconnect,
    switchChain: (chainId: number) => switchChain({ chainId }),
    openAccountModal,
    openChainModal,
    
    // Utilities
    getExplorerTxUrl: (txHash: string) => chainId ? getExplorerTxUrl(chainId, txHash) : '#',
  }
}

// Hook for token balances (USDT, USDC)
export function useTokenBalance(tokenAddress?: `0x${string}`) {
  const { address } = useAccount()
  
  const { data, isLoading, refetch } = useBalance({
    address,
    token: tokenAddress,
  })

  const formattedBalance = data 
    ? parseFloat(formatUnits(data.value, data.decimals)).toFixed(2)
    : '0.00'

  return {
    balance: data,
    formattedBalance,
    symbol: data?.symbol || '',
    isLoading,
    refetch,
  }
}

// Hook to check if user is on a supported chain
export function useIsSupportedChain() {
  const chainId = useChainId()
  return chainId ? !!chainMeta[chainId] : false
}

// Hook for wallet connection status text
export function useWalletStatus() {
  const { isConnected, isConnecting, currentChain, formattedAddress } = useWallet()
  
  if (isConnecting) return 'Connecting...'
  if (!isConnected) return 'Not Connected'
  if (!currentChain) return 'Unsupported Network'
  return `${formattedAddress} on ${currentChain.name}`
}