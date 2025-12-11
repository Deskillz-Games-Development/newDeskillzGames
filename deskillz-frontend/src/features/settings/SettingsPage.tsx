import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  Wallet,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  X,
  Camera,
  Copy,
  ExternalLink,
  Trash2,
  LogOut,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Settings sections
type SettingsSection = 'profile' | 'notifications' | 'security' | 'wallets' | 'preferences'

// Mock user data
const mockUser = {
  id: '1',
  username: 'ProGamer_X',
  email: 'progamer@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  bio: 'Competitive gamer since 2018. Love racing and puzzle games!',
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  createdAt: '2024-01-15',
  emailVerified: true,
  twoFactorEnabled: false,
}

// Mock connected wallets
const mockWallets = [
  { 
    id: '1', 
    address: '0x1234567890abcdef1234567890abcdef12345678', 
    type: 'MetaMask', 
    chain: 'Ethereum',
    isPrimary: true,
    connectedAt: '2024-01-15'
  },
  { 
    id: '2', 
    address: 'TRx1234567890abcdef1234567890abcd', 
    type: 'TronLink', 
    chain: 'Tron',
    isPrimary: false,
    connectedAt: '2024-02-20'
  },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')
  
  // Profile state
  const [username, setUsername] = useState(mockUser.username)
  const [email, setEmail] = useState(mockUser.email)
  const [bio, setBio] = useState(mockUser.bio)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Notification state
  const [notifications, setNotifications] = useState({
    tournamentStart: true,
    tournamentEnd: true,
    matchFound: true,
    prizeWon: true,
    newFollower: false,
    promotions: false,
    emailNotifications: true,
    pushNotifications: true,
    soundEffects: true,
  })

  // Security state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(mockUser.twoFactorEnabled)

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'dark' as 'dark' | 'light' | 'system',
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',
  })

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    setIsEditingProfile(false)
  }

  // Handle notification toggle
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Sections config
  const sections = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'wallets' as const, label: 'Wallets', icon: Wallet },
    { id: 'preferences' as const, label: 'Preferences', icon: Globe },
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/50">Manage your account settings and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                        activeSection === section.id
                          ? 'bg-neon-cyan/20 text-neon-cyan'
                          : 'text-white/70 hover:bg-gaming-light hover:text-white'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                      {activeSection === section.id && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  )
                })}
              </nav>

              {/* Danger Zone */}
              <div className="mt-6 pt-6 border-t border-gaming-border">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neon-red/70 hover:bg-neon-red/10 hover:text-neon-red transition-colors text-left">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold text-white">Profile Information</h2>
                    {!isEditingProfile ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gaming-border">
                        <img
                          src={mockUser.avatar}
                          alt={mockUser.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isEditingProfile && (
                        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-neon-cyan flex items-center justify-center hover:bg-neon-cyan/80 transition-colors">
                          <Camera className="w-4 h-4 text-gaming-dark" />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{mockUser.username}</h3>
                      <p className="text-white/50 text-sm">Member since {new Date(mockUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!isEditingProfile}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border bg-gaming-darker text-white',
                          'focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan',
                          isEditingProfile ? 'border-gaming-border' : 'border-transparent'
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Email
                        {mockUser.emailVerified && (
                          <span className="ml-2 inline-flex items-center gap-1 text-neon-green text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditingProfile}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border bg-gaming-darker text-white',
                          'focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan',
                          isEditingProfile ? 'border-gaming-border' : 'border-transparent'
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={!isEditingProfile}
                        rows={3}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border bg-gaming-darker text-white resize-none',
                          'focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan',
                          isEditingProfile ? 'border-gaming-border' : 'border-transparent'
                        )}
                      />
                    </div>
                  </div>
                </Card>

                {/* Delete Account */}
                <Card className="p-6 border-neon-red/30">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-neon-red/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-neon-red" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">Delete Account</h3>
                      <p className="text-white/50 text-sm mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-neon-red hover:bg-neon-red/10"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="font-display text-xl font-semibold text-white mb-6">Notification Preferences</h2>

                  {/* Tournament Notifications */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
                      Tournament Alerts
                    </h3>
                    <div className="space-y-4">
                      <NotificationToggle
                        label="Tournament Starting"
                        description="Get notified when a tournament you joined is about to start"
                        enabled={notifications.tournamentStart}
                        onToggle={() => toggleNotification('tournamentStart')}
                      />
                      <NotificationToggle
                        label="Tournament Ended"
                        description="Get notified when a tournament has ended and results are available"
                        enabled={notifications.tournamentEnd}
                        onToggle={() => toggleNotification('tournamentEnd')}
                      />
                      <NotificationToggle
                        label="Match Found"
                        description="Get notified when an opponent is found for your match"
                        enabled={notifications.matchFound}
                        onToggle={() => toggleNotification('matchFound')}
                      />
                      <NotificationToggle
                        label="Prize Won"
                        description="Get notified when you win a prize"
                        enabled={notifications.prizeWon}
                        onToggle={() => toggleNotification('prizeWon')}
                      />
                    </div>
                  </div>

                  {/* Social Notifications */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
                      Social
                    </h3>
                    <div className="space-y-4">
                      <NotificationToggle
                        label="New Follower"
                        description="Get notified when someone follows you"
                        enabled={notifications.newFollower}
                        onToggle={() => toggleNotification('newFollower')}
                      />
                      <NotificationToggle
                        label="Promotions & Updates"
                        description="Receive news about platform updates and special offers"
                        enabled={notifications.promotions}
                        onToggle={() => toggleNotification('promotions')}
                      />
                    </div>
                  </div>

                  {/* Delivery Methods */}
                  <div>
                    <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
                      Delivery Methods
                    </h3>
                    <div className="space-y-4">
                      <NotificationToggle
                        label="Email Notifications"
                        description="Receive notifications via email"
                        enabled={notifications.emailNotifications}
                        onToggle={() => toggleNotification('emailNotifications')}
                        icon={<Mail className="w-5 h-5" />}
                      />
                      <NotificationToggle
                        label="Push Notifications"
                        description="Receive push notifications in your browser"
                        enabled={notifications.pushNotifications}
                        onToggle={() => toggleNotification('pushNotifications')}
                        icon={<Smartphone className="w-5 h-5" />}
                      />
                      <NotificationToggle
                        label="Sound Effects"
                        description="Play sound effects for notifications and game events"
                        enabled={notifications.soundEffects}
                        onToggle={() => toggleNotification('soundEffects')}
                        icon={notifications.soundEffects ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        twoFactorEnabled ? 'bg-neon-green/20' : 'bg-gaming-light'
                      )}>
                        <Shield className={cn(
                          'w-6 h-6',
                          twoFactorEnabled ? 'text-neon-green' : 'text-white/50'
                        )} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Two-Factor Authentication</h3>
                        <p className="text-white/50 text-sm mb-2">
                          Add an extra layer of security to your account by requiring a verification code in addition to your password.
                        </p>
                        <span className={cn(
                          'inline-flex items-center gap-1 text-sm font-medium',
                          twoFactorEnabled ? 'text-neon-green' : 'text-white/50'
                        )}>
                          {twoFactorEnabled ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Enabled
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Not enabled
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={twoFactorEnabled ? 'ghost' : 'primary'}
                      size="sm"
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    >
                      {twoFactorEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </Card>

                {/* Change Password */}
                <Card className="p-6">
                  <h2 className="font-display text-xl font-semibold text-white mb-6">Change Password</h2>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
                          className="w-full px-4 py-3 rounded-xl border border-gaming-border bg-gaming-darker text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 rounded-xl border border-gaming-border bg-gaming-darker text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 rounded-xl border border-gaming-border bg-gaming-darker text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan"
                      />
                    </div>

                    <Button variant="primary" className="mt-2">
                      Update Password
                    </Button>
                  </div>
                </Card>

                {/* Active Sessions */}
                <Card className="p-6">
                  <h2 className="font-display text-xl font-semibold text-white mb-6">Active Sessions</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gaming-light rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-neon-green" />
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            Chrome on Windows
                            <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-0.5 rounded">Current</span>
                          </div>
                          <div className="text-sm text-white/50">Last active: Just now</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gaming-light rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gaming-darker flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-white/50" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Safari on iPhone</div>
                          <div className="text-sm text-white/50">Last active: 2 hours ago</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-neon-red hover:bg-neon-red/10">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Wallets Section */}
            {activeSection === 'wallets' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold text-white">Connected Wallets</h2>
                    <Button variant="primary" size="sm" leftIcon={<Wallet className="w-4 h-4" />}>
                      Connect Wallet
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {mockWallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        className={cn(
                          'p-4 rounded-xl border transition-colors',
                          wallet.isPrimary
                            ? 'bg-neon-cyan/10 border-neon-cyan/30'
                            : 'bg-gaming-light border-gaming-border'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center',
                              wallet.isPrimary ? 'bg-neon-cyan/20' : 'bg-gaming-darker'
                            )}>
                              <Wallet className={cn(
                                'w-6 h-6',
                                wallet.isPrimary ? 'text-neon-cyan' : 'text-white/50'
                              )} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{wallet.type}</span>
                                {wallet.isPrimary && (
                                  <span className="text-xs bg-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-white/50">
                                <span className="font-mono">
                                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                                </span>
                                <span>•</span>
                                <span>{wallet.chain}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(wallet.address)}
                              className="p-2 rounded-lg hover:bg-gaming-darker text-white/50 hover:text-white transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gaming-darker text-white/50 hover:text-white transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            {!wallet.isPrimary && (
                              <Button variant="ghost" size="sm" className="text-neon-red hover:bg-neon-red/10">
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="mt-6 p-4 bg-gaming-darker rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
                    <p className="text-sm text-white/50">
                      Your primary wallet is used for tournament entry fees and receiving prizes. 
                      You can connect multiple wallets across different chains.
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="font-display text-xl font-semibold text-white mb-6">Display Preferences</h2>

                  {/* Theme */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-white/70 mb-4">Theme</label>
                    <div className="flex gap-3">
                      {[
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'system', label: 'System', icon: Globe },
                      ].map((theme) => {
                        const Icon = theme.icon
                        return (
                          <button
                            key={theme.id}
                            onClick={() => setPreferences(prev => ({ ...prev, theme: theme.id as typeof prev.theme }))}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-colors',
                              preferences.theme === theme.id
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                : 'bg-gaming-light border-gaming-border text-white/70 hover:text-white'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{theme.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-white/70 mb-2">Language</label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gaming-border bg-gaming-darker text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="pt">Português</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                    </select>
                  </div>

                  {/* Currency */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-white/70 mb-2">Display Currency</label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gaming-border bg-gaming-darker text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Timezone</label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gaming-border bg-gaming-darker text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Shanghai (CST)</option>
                    </select>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Notification Toggle Component
function NotificationToggle({
  label,
  description,
  enabled,
  onToggle,
  icon,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gaming-light rounded-xl">
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            enabled ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-gaming-darker text-white/50'
          )}>
            {icon}
          </div>
        )}
        <div>
          <div className="font-medium text-white">{label}</div>
          <div className="text-sm text-white/50">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'relative w-12 h-7 rounded-full transition-colors',
          enabled ? 'bg-neon-cyan' : 'bg-gaming-darker'
        )}
      >
        <motion.div
          layout
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ left: enabled ? '1.5rem' : '0.25rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}