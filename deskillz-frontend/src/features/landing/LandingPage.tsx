import { motion } from 'framer-motion'
import { 
  Gamepad2, 
  Trophy, 
  Wallet, 
  Users, 
  Zap, 
  Shield,
  ChevronRight,
  Clock,
  Target,
  Coins,
  Upload,
  Code,
  PieChart,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Globe,
  Lock
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ParticleField from '@/components/effects/ParticleField'

// How it works steps
const howItWorks = [
  {
    step: 1,
    title: 'Connect Wallet',
    description: 'Link your Web3 wallet (MetaMask, TronLink, Phantom, etc.) to get started',
    icon: Wallet,
    color: 'neon-cyan',
  },
  {
    step: 2,
    title: 'Choose a Game',
    description: 'Browse skill-based games and find your competitive edge',
    icon: Gamepad2,
    color: 'neon-purple',
  },
  {
    step: 3,
    title: 'Enter Tournament',
    description: 'Pay entry fee with your preferred crypto (ETH, BTC, SOL, USDT, etc.)',
    icon: Trophy,
    color: 'neon-pink',
  },
  {
    step: 4,
    title: 'Compete & Win',
    description: 'Play your best, top the leaderboard, and win the prize pool',
    icon: Coins,
    color: 'neon-green',
  },
]

// Tournament modes
const tournamentModes = [
  {
    name: 'Synchronous',
    badge: 'REAL-TIME',
    description: 'Compete head-to-head with 2-10 players simultaneously. Everyone plays at the same time, and the highest score wins.',
    features: [
      'Real-time competition',
      'Up to 10 players per match',
      'Live leaderboard updates',
      'Instant results',
    ],
    icon: Zap,
    color: 'from-neon-cyan to-primary-500',
  },
  {
    name: 'Asynchronous',
    badge: 'FLEXIBLE',
    description: 'Enter tournaments and play before the deadline. Perfect for players across different time zones.',
    features: [
      'Play anytime before deadline',
      'Unlimited participants',
      'Global competition',
      'Tournament duration: hours to days',
    ],
    icon: Clock,
    color: 'from-neon-purple to-neon-pink',
  },
]

// Platform features
const platformFeatures = [
  {
    icon: Shield,
    title: 'Fair & Transparent',
    description: 'Blockchain-verified scores ensure every competition is legitimate. No cheating, no manipulation.',
  },
  {
    icon: Zap,
    title: 'Instant Payouts',
    description: 'Winners receive prizes directly to their wallet in their chosen cryptocurrency. No waiting periods.',
  },
  {
    icon: Lock,
    title: 'Secure Escrow',
    description: 'All entry fees are held in smart contract escrow until tournament completion.',
  },
  {
    icon: Users,
    title: 'Skill-Based Matching',
    description: 'AI-powered matchmaking ensures you compete against players of similar skill levels.',
  },
  {
    icon: Globe,
    title: 'Play Anywhere',
    description: 'Download games on Android or iOS. Your progress syncs across all devices.',
  },
  {
    icon: Target,
    title: 'Refund Protection',
    description: "If a tournament doesn't fill minimum players, everyone gets a full refund automatically.",
  },
]

// Developer benefits
const developerBenefits = [
  {
    icon: Upload,
    title: 'Easy Integration',
    description: 'Upload your Unity or Unreal game and integrate our SDK in minutes.',
  },
  {
    icon: PieChart,
    title: 'Revenue Sharing',
    description: 'Earn a share of every tournament entry fee from your game.',
  },
  {
    icon: Code,
    title: 'Powerful SDK',
    description: 'Full-featured SDK with score submission, matchmaking, and anti-cheat built-in.',
  },
]

// Supported wallets
const supportedWallets = [
  { name: 'MetaMask', logo: '🦊' },
  { name: 'TronLink', logo: '⚡' },
  { name: 'WalletConnect', logo: '🔗' },
  { name: 'Trust Wallet', logo: '🛡️' },
  { name: 'Coinbase', logo: '🔵' },
  { name: 'Phantom', logo: '👻' },
]

// Supported currencies
const supportedCurrencies = [
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'BNB', name: 'BNB', color: '#F0B90B' },
  { symbol: 'SOL', name: 'Solana', color: '#9945FF' },
  { symbol: 'XRP', name: 'XRP', color: '#23292F' },
  { symbol: 'USDT', name: 'Tether', color: '#26A17B' },
  { symbol: 'USDC', name: 'USD Coin', color: '#2775CA' },
]

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Particle effect */}
        <ParticleField particleCount={30} />
        
        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <Badge variant="info" size="lg" className="mb-6" glow>
              <Zap className="w-4 h-4" />
              Web3 Competitive Gaming Platform
            </Badge>
            
            {/* Main heading */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">SKILL MEETS</span>
              <br />
              <span className="text-gradient">BLOCKCHAIN</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto mb-10 font-body">
              Compete in skill-based mobile game tournaments. 
              <span className="text-neon-cyan"> Win crypto prizes</span> paid directly to your Web3 wallet.
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ChevronRight className="w-5 h-5" />}
              >
                Get Started
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Code className="w-5 h-5" />}
              >
                Developer Portal
              </Button>
            </div>

            {/* Supported currencies */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <p className="text-sm text-white/40 uppercase tracking-wider">Pay & Win With</p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {supportedCurrencies.map((currency) => (
                  <div
                    key={currency.symbol}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gaming-light/50 border border-gaming-border
                      hover:border-neon-cyan/50 transition-colors cursor-pointer"
                    title={currency.name}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${currency.color}20`, color: currency.color }}
                    >
                      {currency.symbol.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-white">{currency.symbol}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported wallets */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-white/40 uppercase tracking-wider">Supported Wallets</p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {supportedWallets.map((wallet) => (
                  <div
                    key={wallet.name}
                    className="w-11 h-11 rounded-xl bg-gaming-light/50 border border-gaming-border flex items-center justify-center
                      hover:border-neon-cyan/50 transition-colors cursor-pointer"
                    title={wallet.name}
                  >
                    <span className="text-xl">{wallet.logo}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gaming-dark to-transparent" />
      </section>

      {/* How It Works Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="default" size="md" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              From connecting your wallet to winning prizes - here's your journey on Deskillz.games
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-green opacity-30" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card variant="glow" className="text-center p-6 h-full">
                    {/* Step number */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-transparent border border-neon-cyan/30 flex items-center justify-center relative">
                      <item.icon className="w-8 h-8 text-neon-cyan" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gaming-dark border border-gaming-border flex items-center justify-center font-display text-xs font-bold text-white">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/50">
                      {item.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Modes Section */}
      <section className="relative py-20 bg-gaming-darker/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="info" size="md" className="mb-4">
              Tournament Structure
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Two Ways to Compete
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Choose your battle style - compete in real-time or play at your own pace
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tournamentModes.map((mode, index) => (
              <motion.div
                key={mode.name}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full p-8 relative overflow-hidden">
                  {/* Background gradient */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${mode.color} opacity-5 blur-3xl`} />
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                        <mode.icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge variant={index === 0 ? 'info' : 'default'} size="sm">
                        {mode.badge}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-display text-2xl font-bold text-white mb-3">
                      {mode.name} Mode
                    </h3>
                    <p className="text-white/60 mb-6">
                      {mode.description}
                    </p>
                    
                    {/* Features */}
                    <ul className="space-y-3">
                      {mode.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                          <CheckCircle2 className="w-4 h-4 text-neon-green flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tournament Flow Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <Card className="p-8">
              <h3 className="font-display text-xl font-semibold text-white mb-8 text-center">
                Tournament Prize Distribution
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                {/* Entry fees */}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gaming-light border border-gaming-border flex items-center justify-center">
                    <Users className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-sm text-white/50">Players Entry Fees</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-neon-cyan hidden md:block" />
                <div className="w-px h-8 bg-neon-cyan md:hidden" />
                
                {/* Tournament Bracket Visualization */}
                <div className="text-center">
                  <div className="w-40 h-36 mx-auto mb-3 relative">
                    {/* Bracket SVG */}
                    <svg viewBox="0 0 140 110" className="w-full h-full">
                      {/* Player 1 box */}
                      <rect x="5" y="10" width="40" height="24" rx="4" 
                        fill="#1a1a2e" stroke="#00f0ff" strokeWidth="2"/>
                      <text x="25" y="26" fill="#00f0ff" fontSize="10" fontFamily="Orbitron" textAnchor="middle">P1</text>
                      
                      {/* Player 2 box */}
                      <rect x="5" y="76" width="40" height="24" rx="4" 
                        fill="#1a1a2e" stroke="#bf00ff" strokeWidth="2"/>
                      <text x="25" y="92" fill="#bf00ff" fontSize="10" fontFamily="Orbitron" textAnchor="middle">P2</text>
                      
                      {/* Bracket lines */}
                      <path d="M45 22 L60 22 L60 55 L80 55" 
                        stroke="#00f0ff" fill="none" strokeWidth="2"/>
                      <path d="M45 88 L60 88 L60 55 L80 55" 
                        stroke="#bf00ff" fill="none" strokeWidth="2"/>
                      
                      {/* Center dot */}
                      <circle cx="60" cy="55" r="3" fill="#00f0ff"/>
                      
                      {/* Winner box */}
                      <rect x="80" y="38" width="50" height="34" rx="6" 
                        fill="#00ff88" fillOpacity="0.15" stroke="#00ff88" strokeWidth="2"/>
                      <text x="105" y="52" fill="#00ff88" fontSize="8" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">WINNER</text>
                      <text x="105" y="66" fill="#FFD700" fontSize="14" textAnchor="middle">🏆</text>
                    </svg>
                  </div>
                  <p className="text-sm text-white/50">Tournament Match</p>
                  <p className="text-xs text-white/30">Highest Score Wins</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-neon-cyan hidden md:block" />
                <div className="w-px h-8 bg-neon-cyan md:hidden" />
                
                {/* USDT Prize */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-900/50 to-green-900/50 border-2 border-neon-green flex items-center justify-center"
                    style={{ boxShadow: '0 0 30px rgba(0, 255, 136, 0.4), inset 0 0 20px rgba(0, 255, 136, 0.1)' }}>
                    {/* USDT Logo */}
                    <svg viewBox="0 0 32 32" className="w-14 h-14">
                      <circle cx="16" cy="16" r="15" fill="#26A17B"/>
                      <path d="M17.9 17.9v-1.5h3v-2.3h-8.2v2.3h3v1.5c-2.6.2-4.5 1-4.5 2.1s1.9 1.9 4.5 2.1v4.8h2.2v-4.8c2.6-.2 4.5-1 4.5-2.1s-1.9-1.9-4.5-2.1zm0 3.4v-2.1c2.5.2 4.1.8 4.1 1.4s-1.6 1.2-4.1 1.4v-.7zm-2.2-2.1v2.1c-2.5-.2-4.1-.8-4.1-1.4s1.6-1.2 4.1-1.4v.7zM17.9 8h-3.6v2h3.6V8z" 
                        fill="white"/>
                      <path d="M17.9 10h-3.6v1.8h3.6V10z" fill="white"/>
                    </svg>
                  </div>
                  <p className="text-sm text-neon-green font-semibold">Prize Pool</p>
                  <p className="text-xs text-white/50">Paid in USDT</p>
                </div>
              </div>
              
              {/* Note */}
              <p className="text-center text-xs text-white/30 mt-8">
                Winner takes the prize pool. Compete, win, and withdraw directly to your wallet.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="success" size="md" className="mb-4">
              Platform Benefits
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Fair Competition
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Every feature designed to ensure transparent, secure, and enjoyable gaming
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 h-full group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 
                    border border-gaming-border group-hover:border-neon-cyan/30
                    flex items-center justify-center mb-4 transition-colors">
                    <feature.icon className="w-6 h-6 text-neon-cyan" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="relative py-20 bg-gaming-darker/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="premium" size="md" className="mb-4">
                For Developers
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                Monetize Your Games
              </h2>
              <p className="text-white/60 mb-8">
                Already have a Unity or Unreal game? Integrate our SDK and start earning from tournaments. 
                We handle payments, matchmaking, and anti-cheat - you focus on making great games.
              </p>
              
              <div className="space-y-4 mb-8">
                {developerBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-white mb-1">{benefit.title}</h4>
                      <p className="text-sm text-white/50">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                variant="secondary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View SDK Documentation
              </Button>
            </motion.div>
            
            {/* Right - Code preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 font-mono text-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-neon-red" />
                  <div className="w-3 h-3 rounded-full bg-neon-yellow" />
                  <div className="w-3 h-3 rounded-full bg-neon-green" />
                  <span className="ml-2 text-white/30 text-xs">DeskillzSDK.cs</span>
                </div>
                <pre className="text-white/70 overflow-x-auto">
                  <code>{`// Initialize SDK
DeskillzSDK.Initialize(gameId, apiKey);

// Submit score when game ends
DeskillzSDK.Score.Submit(
  score: playerScore,
  onSuccess: () => {
    Debug.Log("Score submitted!");
  }
);

// Handle tournament results
DeskillzSDK.Tournament.OnComplete += (result) => {
  if (result.isWinner) {
    ShowVictoryScreen(result.prizeWon);
  }
};`}</code>
                </pre>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile Apps Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge variant="info" size="md" className="mb-4">
              <Smartphone className="w-4 h-4" />
              Mobile Gaming
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Download & Play
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto mb-10">
              Each game is a standalone app available for Android and iOS. 
              Download from Deskillz.games, connect your wallet, and start competing.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="min-w-[200px]"
              >
                <span className="text-2xl mr-2">🤖</span>
                Android Games
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="min-w-[200px]"
              >
                <span className="text-2xl mr-2">🍎</span>
                iOS Games
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card variant="glow" className="relative overflow-hidden">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-purple/10" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl" />
              
              <div className="relative p-8 sm:p-12 text-center">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Compete?
                </h2>
                <p className="text-white/60 mb-8 max-w-lg mx-auto">
                  Connect your wallet and explore the games. Your next victory awaits.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Wallet className="w-5 h-5" />}
                  >
                    Connect Wallet
                  </Button>
                  <Button variant="ghost" size="lg">
                    Browse Games
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}