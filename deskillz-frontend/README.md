# Deskillz.Games v2.0

A modern Web3 competitive gaming platform built with React 18, TypeScript, Tailwind CSS, and Framer Motion.

![Deskillz.Games](https://deskillz.games/og-image.png)

## 🎮 Features

- **Cyberpunk Gaming Aesthetic** - Neon glows, particle effects, animated backgrounds
- **Web3 Integration** - MetaMask, TronLink, WalletConnect support
- **Real-time Tournaments** - Sync and async game modes
- **USDT Prize Pools** - Instant blockchain payouts
- **Responsive Design** - Mobile-first approach

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/deskillz/deskillz-games.git
cd deskillz-games

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand + TanStack Query |
| Web3 | wagmi + viem |
| Icons | Lucide React |

## 📁 Project Structure

```
src/
├── app/                    # App-level config, providers
├── components/
│   ├── ui/                 # Button, Card, Badge, etc.
│   ├── layout/             # Header, Footer, MainLayout
│   ├── effects/            # ParticleField, GridBackground, GlowOrb
│   ├── game/               # Game-specific components
│   ├── tournament/         # Tournament components
│   └── wallet/             # Wallet connection components
├── features/
│   ├── landing/            # Landing page
│   ├── games/              # Game discovery
│   ├── tournaments/        # Tournament flows
│   ├── profile/            # Player dashboard
│   └── developer/          # Developer portal
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
├── types/                  # TypeScript types
└── styles/                 # Global styles
```

## 🎨 Design System

### Colors

```css
/* Neon Accents */
--neon-cyan: #00f0ff;
--neon-purple: #bf00ff;
--neon-pink: #ff0080;
--neon-green: #00ff88;

/* Gaming Dark Theme */
--gaming-darker: #05050a;
--gaming-dark: #0a0a14;
--gaming-light: #1a1a2e;
```

### Fonts

- **Display**: Orbitron (headings, UI elements)
- **Body**: Rajdhani (body text)
- **Mono**: JetBrains Mono (code, numbers)

### Components

All UI components support the gaming aesthetic:
- Neon glow effects
- Animated borders
- Glass morphism
- Scan line overlays

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://api.deskillz.games
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### API Proxy (Development)

The Vite dev server proxies `/api` requests to the production API. Configure in `vite.config.ts`.

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, featured games, live tournaments |
| `/games` | Game discovery with filters and search |
| `/games/:id` | Game detail with tournaments |
| `/tournaments` | All tournaments listing |
| `/tournaments/:id` | Tournament lobby |
| `/profile` | Player dashboard |
| `/developer` | Developer portal |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with 💜 by the Deskillz Team
