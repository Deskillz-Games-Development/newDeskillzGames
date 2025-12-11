import { Link } from 'react-router-dom'
import { 
  Gamepad2, 
  Twitter, 
  MessageCircle, 
  Github,
  Mail
} from 'lucide-react'

const footerLinks = {
  platform: [
    { name: 'Browse Games', href: '/games' },
    { name: 'Tournaments', href: '/tournaments' },
    { name: 'Leaderboards', href: '/leaderboards' },
    { name: 'How It Works', href: '/how-it-works' },
  ],
  developers: [
    { name: 'Developer Portal', href: '/developer' },
    { name: 'SDK Documentation', href: '/developer/docs' },
    { name: 'API Reference', href: '/developer/api' },
    { name: 'Submit Your Game', href: '/developer/games/new' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Responsible Gaming', href: '/responsible-gaming' },
  ],
}

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/deskillz', icon: Twitter },
  { name: 'Discord', href: 'https://discord.gg/deskillz', icon: MessageCircle },
  { name: 'GitHub', href: 'https://github.com/deskillz', icon: Github },
  { name: 'Email', href: 'mailto:hello@deskillz.games', icon: Mail },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-gaming-border/50 bg-gaming-darker/50">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-display text-xl font-bold tracking-wider text-white">
                  DESKILLZ
                </span>
                <span className="font-display text-xl font-bold tracking-wider text-neon-cyan">
                  .GAMES
                </span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              The premier Web3 competitive gaming platform. Compete in skill-based tournaments, 
              win USDT prizes, and prove you're the best.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gaming-light/50 border border-gaming-border flex items-center justify-center
                    text-white/50 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-neon-cyan transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Developers
            </h3>
            <ul className="space-y-3">
              {footerLinks.developers.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-neon-cyan transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-neon-cyan transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-neon-cyan transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gaming-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} Deskillz.games. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-white/30">Powered by</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-neon-cyan">TRON</span>
              <span className="text-white/30">|</span>
              <span className="text-sm font-mono text-neon-green">USDT</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
