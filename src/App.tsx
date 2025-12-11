import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { WalletProvider } from './providers/WalletProvider'

// Layouts
import MainLayout from './components/layout/MainLayout'

// Pages
import LandingPage from './features/landing/LandingPage'
import GamesPage from './features/games/GamesPage'
import GameDetailPage from './features/games/GameDetailPage'
import TournamentsPage from './features/tournaments/TournamentsPage'
import ProfilePage from './features/profile/ProfilePage'
import DeveloperPortal from './features/developer/DeveloperPortal'
import LeaderboardsPage from './features/leaderboards/LeaderboardsPage'
import MatchmakingPage from './features/matchmaking/MatchmakingPage'
import GameplayPage from './features/gameplay/GameplayPage'
import TournamentDetailPage from './features/tournaments/TournamentDetailPage'
import SettingsPage from './features/settings/SettingsPage'
import TransactionsPage from './features/profile/TransactionsPage'
import AdminDashboard from './features/admin/AdminDashboard'

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          {/* Full-screen pages (no layout) */}
          <Route path="/tournaments/:tournamentId/play" element={<GameplayPage />} />
          
          {/* Main Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/:id" element={<GameDetailPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/tournaments/:tournamentId" element={<TournamentDetailPage />} />
            <Route path="/tournaments/:tournamentId/matchmaking" element={<MatchmakingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/developer" element={<DeveloperPortal />} />
            <Route path="/leaderboards" element={<LeaderboardsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid #2a2a4a',
            },
            success: {
              iconTheme: {
                primary: '#00ff88',
                secondary: '#1a1a2e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff0044',
                secondary: '#1a1a2e',
              },
            },
          }}
        />
      </BrowserRouter>
    </WalletProvider>
  )
}

export default App