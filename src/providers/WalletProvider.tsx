import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '@/lib/wallet-config'

import '@rainbow-me/rainbowkit/styles.css'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
    },
  },
})

// Custom theme for RainbowKit matching our gaming aesthetic
const customTheme = darkTheme({
  accentColor: '#00F5D4', // neon-cyan
  accentColorForeground: '#0A0F1C', // gaming-dark
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
})

// Override specific theme properties
const deskillzTheme = {
  ...customTheme,
  colors: {
    ...customTheme.colors,
    modalBackground: '#0F1629', // gaming-darker
    modalBorder: '#1E293B', // gaming-border
    profileForeground: '#0F1629',
    closeButton: '#94A3B8',
    closeButtonBackground: '#1E293B',
    actionButtonBorder: '#00F5D4',
    actionButtonBorderMobile: '#00F5D4',
    actionButtonSecondaryBackground: '#1A2235',
    connectButtonBackground: '#00F5D4',
    connectButtonBackgroundError: '#FF6B6B',
    connectButtonInnerBackground: '#1A2235',
    connectButtonText: '#0A0F1C',
    connectButtonTextError: '#FFFFFF',
    connectionIndicator: '#39FF14', // neon-green
    error: '#FF6B6B',
    generalBorder: '#1E293B',
    generalBorderDim: '#1E293B',
    menuItemBackground: '#1A2235',
    profileAction: '#1A2235',
    profileActionHover: '#242F47',
    selectedOptionBorder: '#00F5D4',
    standby: '#F0B90B',
  },
  radii: {
    ...customTheme.radii,
    actionButton: '12px',
    connectButton: '12px',
    menuButton: '12px',
    modal: '16px',
    modalMobile: '16px',
  },
  shadows: {
    ...customTheme.shadows,
    connectButton: '0 4px 12px rgba(0, 245, 212, 0.15)',
    dialog: '0 8px 32px rgba(0, 0, 0, 0.32)',
    profileDetailsAction: 'none',
    selectedOption: '0 0 0 2px rgba(0, 245, 212, 0.5)',
    selectedWallet: '0 0 0 2px rgba(0, 245, 212, 0.5)',
    walletLogo: 'none',
  },
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={deskillzTheme}
          modalSize="compact"
          appInfo={{
            appName: 'Deskillz.Games',
            learnMoreUrl: 'https://deskillz.games/learn',
            disclaimer: ({ Text, Link }) => (
              <Text>
                By connecting your wallet, you agree to our{' '}
                <Link href="https://deskillz.games/terms">Terms of Service</Link> and{' '}
                <Link href="https://deskillz.games/privacy">Privacy Policy</Link>
              </Text>
            ),
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}