# Deskillz.Games Platform Architecture & Design Document

## Executive Summary

Deskillz.games is a Web3-powered competitive gaming platform where players compete in skill-based tournaments for USDT (Tron) prize pools. Game developers can integrate their Unity/Unreal games via SDK and participate in revenue sharing.

---

## 1. Platform Users & Roles

| Role | Description |
|------|-------------|
| **Player** | Competes in tournaments, manages wallet, tracks performance |
| **Game Developer** | Uploads games, integrates SDK, monitors revenue |
| **Platform Admin** | Manages platform, approves games, handles disputes |

---

## 2. Recommended Technology Stack

### Frontend (Web App)
```
Framework:      React 19 + Vite + TypeScript
Styling:        Tailwind CSS + Framer Motion (animations)
State:          Zustand (lightweight) + TanStack Query (server state)
Web3:           wagmi + viem (modern Web3 React hooks)
Real-time:      Socket.io client
Charts:         Recharts or Victory
Forms:          React Hook Form + Zod validation
```

### Backend
```
Runtime:        Node.js 20+ with NestJS (structured, scalable)
Database:       PostgreSQL (primary) + Redis (caching, sessions, leaderboards)
Real-time:      Socket.io
Queue:          BullMQ (tournament processing, payouts)
Storage:        AWS S3 / Cloudflare R2 (game files, assets)
Smart Contracts: Solidity on Tron (TRC-20 USDT handling)
```

### AI/ML Infrastructure
```
ML Platform:    Python FastAPI microservice
Models:         TensorFlow/PyTorch
Vector DB:      Pinecone or Qdrant (for recommendations)
Feature Store:  Feast or custom Redis-based
```

### DevOps
```
Hosting:        Vercel (frontend) + AWS/Railway (backend)
CI/CD:          GitHub Actions
Monitoring:     Sentry + Datadog
CDN:            Cloudflare
```

---

## 3. Database Schema (Core Entities)

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Users     │────▶│ WalletAccounts  │     │   Games      │
├─────────────┤     ├─────────────────┤     ├──────────────┤
│ id          │     │ id              │     │ id           │
│ username    │     │ user_id         │     │ developer_id │
│ email       │     │ wallet_address  │     │ name         │
│ role        │     │ wallet_type     │     │ description  │
│ avatar_url  │     │ is_primary      │     │ icon_url     │
│ created_at  │     └─────────────────┘     │ banner_url   │
└─────────────┘                             │ genre        │
      │                                     │ platform     │
      │         ┌─────────────────┐         │ sdk_version  │
      │         │  Tournaments    │◀────────│ status       │
      │         ├─────────────────┤         │ android_url  │
      │         │ id              │         │ ios_url      │
      │         │ game_id         │         │ demo_enabled │
      │         │ name            │         └──────────────┘
      │         │ entry_fee       │
      │         │ prize_pool      │         ┌──────────────┐
      │         │ max_players     │         │ GameScores   │
      │         │ mode (sync/async│         ├──────────────┤
      │         │ starts_at       │────────▶│ id           │
      │         │ ends_at         │         │ tournament_id│
      │         │ status          │         │ user_id      │
      │         │ service_fee_%   │         │ score        │
      └────────▶└─────────────────┘         │ verified     │
                        │                   │ submitted_at │
                        ▼                   └──────────────┘
              ┌─────────────────┐
              │ TournamentEntry │         ┌──────────────────┐
              ├─────────────────┤         │ Transactions     │
              │ id              │         ├──────────────────┤
              │ tournament_id   │         │ id               │
              │ user_id         │         │ user_id          │
              │ entry_tx_hash   │         │ type             │
              │ status          │         │ amount           │
              │ joined_at       │         │ tx_hash          │
              │ final_rank      │         │ status           │
              │ prize_won       │         │ created_at       │
              └─────────────────┘         └──────────────────┘
```

---

## 4. Page Structure & User Flows

### 4.1 Player-Facing Pages

```
/                           → Landing page (hero, featured games, live tournaments)
/games                      → Game discovery (browse, filter, search)
/games/:id                  → Game detail (info, demo play, tournaments list)
/tournaments                → All tournaments (filters: game, entry fee, status)
/tournaments/:id            → Tournament lobby (players, countdown, leaderboard)
/tournaments/:id/play       → Active gameplay session
/profile                    → Player dashboard (stats, history, achievements)
/profile/transactions       → Wallet & transaction history
/profile/settings           → Account settings
/leaderboards               → Global & per-game leaderboards
/connect-wallet             → Wallet connection flow
```

### 4.2 Developer Portal Pages

```
/developer                  → Developer dashboard (overview, revenue, stats)
/developer/games            → My games list
/developer/games/new        → Upload new game
/developer/games/:id        → Game management (edit, analytics, tournaments)
/developer/games/:id/sdk    → SDK integration guide & keys
/developer/revenue          → Revenue reports & payouts
/developer/settings         → Developer account settings
/developer/docs             → SDK documentation
```

### 4.3 Admin Pages

```
/admin                      → Admin dashboard
/admin/games                → Game approval queue
/admin/tournaments          → Tournament management
/admin/users                → User management
/admin/disputes             → Dispute resolution
/admin/finance              → Platform financials
```

---

## 5. Core User Flows

### 5.1 Player Tournament Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Browse Games │────▶│ Select Game  │────▶│ View Active  │
│              │     │              │     │ Tournaments  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                     ┌──────────────┐            ▼
                     │ Tournament   │     ┌──────────────┐
                     │ Lobby        │◀────│ Pay Entry   │
                     │ (wait/ready) │     │ (Web3 Wallet)│
                     └──────┬───────┘     └──────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Sync Mode    │     │ Async Mode   │     │ Tournament   │
│ (Real-time   │     │ (Play before │     │ Cancelled    │
│ 2-10 players)│     │ deadline)    │     │ (Refund)     │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       └────────┬───────────┘
                ▼
        ┌──────────────┐     ┌──────────────┐
        │ Submit Score │────▶│ Leaderboard  │
        │ (Verified)   │     │ Final Result │
        └──────────────┘     └──────┬───────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
              ┌──────────────┐              ┌──────────────┐
              │ Winner:      │              │ Others:      │
              │ Prize to     │              │ Better luck  │
              │ Wallet       │              │ next time    │
              └──────────────┘              └──────────────┘
```

### 5.2 Developer Game Upload Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Register as  │────▶│ Access Dev   │────▶│ Download SDK │
│ Developer    │     │ Portal       │     │ (Unity/UE)   │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Game Live!   │◀────│ Admin Review │◀────│ Upload Game  │
│ Start earning│     │ & Approval   │     │ APK/IPA +    │
└──────────────┘     └──────────────┘     │ Metadata     │
                                          └──────────────┘
```

---

## 6. AI/ML Integration Strategy

### 6.1 Skill-Based Matchmaking (Priority: HIGH)

**Problem:** Unfair matches frustrate players and reduce engagement.

**Solution:** ML-powered matchmaking that considers:
- Player skill rating (Elo/Glicko-2 system)
- Recent performance trend
- Game-specific skill levels
- Latency/region matching for sync mode

```python
# Simplified matchmaking model inputs
features = {
    'player_elo': 1450,
    'games_played': 127,
    'win_rate_7d': 0.58,
    'avg_score_percentile': 72,
    'preferred_entry_fee': 5.0,
    'region': 'NA',
    'device_type': 'android'
}
# Output: Matched tournament or player group
```

**Tech:** Custom Elo implementation + TensorFlow model for advanced matching

---

### 6.2 Fraud & Cheat Detection (Priority: CRITICAL)

**Problem:** Score manipulation, bots, and exploits destroy platform integrity.

**Solution:** Multi-layer ML fraud detection:

| Layer | Detection Method |
|-------|------------------|
| Score Anomaly | Statistical outlier detection on score distributions |
| Behavioral | Unusual play patterns, impossible reaction times |
| Device | Emulator detection, rooted device flags |
| Network | VPN/proxy detection, multi-accounting |
| Collusion | Graph analysis of player relationships |

```python
# Fraud detection pipeline
class FraudDetector:
    def analyze_score(self, score_data):
        # 1. Statistical check against game's score distribution
        # 2. Compare to player's historical performance
        # 3. Analyze score progression pattern
        # 4. Check for known exploit signatures
        return risk_score, flags
```

**Tech:** Isolation Forest + LSTM for behavioral patterns + Graph Neural Networks for collusion

---

### 6.3 Personalized Game Recommendations (Priority: MEDIUM)

**Problem:** Players don't discover games they'd enjoy.

**Solution:** Recommendation engine based on:
- Play history and preferences
- Similar player behavior (collaborative filtering)
- Game attributes (content-based)
- Trending/popular in their skill bracket

```
User likes: Puzzle games, medium difficulty, short sessions
Similar users also enjoyed: [Game A, Game B, Game C]
Recommended: "Speed Chess" (puzzle, competitive, 5-min rounds)
```

**Tech:** Two-tower neural network + vector similarity search (Pinecone)

---

### 6.4 Dynamic Tournament Creation (Priority: MEDIUM)

**Problem:** Static tournament schedules don't match player demand.

**Solution:** AI-driven tournament spawning:
- Predict demand based on time, day, recent activity
- Auto-create tournaments when player queue reaches threshold
- Optimize entry fees and prize pools for maximum participation

**Tech:** Time-series forecasting (Prophet/LSTM) + reinforcement learning for pricing

---

### 6.5 AI-Powered Player Insights (Priority: LOW)

**Problem:** Players want to improve but don't know how.

**Solution:** Personalized coaching insights:
- "Your puzzle solve time improved 12% this week"
- "Top players in this game average 15% higher on level 3"
- "You perform best on weekday evenings"

**Tech:** Analytics pipeline + GPT-4 for natural language insights

---

### 6.6 Smart Customer Support (Priority: LOW)

**Solution:** AI chatbot for common queries:
- Tournament rules and status
- Wallet/transaction help
- Game recommendations
- Escalation to human support when needed

**Tech:** RAG system with platform knowledge base + Claude API

---

## 7. Web3 Wallet Integration

### Supported Wallets

| Wallet | Platform | Priority |
|--------|----------|----------|
| MetaMask | Browser/Mobile | Primary |
| TronLink | Browser/Mobile | Primary (Tron native) |
| WalletConnect | Universal | Secondary |
| Trust Wallet | Mobile | Secondary |
| Coinbase Wallet | Browser/Mobile | Tertiary |

### Wallet Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Click       │────▶│ Select      │────▶│ Approve     │
│ "Connect"   │     │ Wallet Type │     │ Connection  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐            ▼
                    │ Ready to    │◀───────────┤
                    │ Play!       │     ┌──────┴──────┐
                    └─────────────┘     │ Sign        │
                                        │ Message     │
                                        │ (Verify)    │
                                        └─────────────┘
```

### Transaction Types

1. **Entry Fee Payment** - Player → Platform escrow
2. **Prize Distribution** - Platform → Winner wallet
3. **Refund** - Platform → Player (cancelled tournament)
4. **Developer Payout** - Platform → Developer wallet
5. **Withdrawal** - Platform balance → External wallet

---

## 8. SDK Architecture (Unity/Unreal)

### SDK Responsibilities

```
┌────────────────────────────────────────────────────────┐
│                    Deskillz SDK                        │
├────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Auth Module  │  │ Tournament   │  │ Score        │ │
│  │              │  │ Module       │  │ Module       │ │
│  │ • Init       │  │ • Join       │  │ • Submit     │ │
│  │ • User sync  │  │ • Leave      │  │ • Verify     │ │
│  │ • Session    │  │ • Status     │  │ • Encrypt    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Sync Play    │  │ Analytics    │  │ Anti-Cheat   │ │
│  │ Module       │  │ Module       │  │ Module       │ │
│  │ • Real-time  │  │ • Events     │  │ • Integrity  │ │
│  │ • State sync │  │ • Crashes    │  │ • Validation │ │
│  │ • Matchmake  │  │ • Sessions   │  │ • Reporting  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────┘
```

### SDK Integration (Unity Example)

```csharp
// Initialize SDK
DeskillzSDK.Initialize("YOUR_GAME_ID", "YOUR_API_KEY");

// Start tournament match
DeskillzSDK.Tournament.OnMatchStart += (matchInfo) => {
    // matchInfo.mode (sync/async)
    // matchInfo.players[]
    // matchInfo.tournamentId
    StartGame(matchInfo);
};

// Submit score (encrypted, tamper-proof)
DeskillzSDK.Score.Submit(
    score: playerScore,
    metadata: gameStateHash,
    onSuccess: () => ShowResults(),
    onError: (err) => HandleError(err)
);

// Sync mode: real-time state
DeskillzSDK.Sync.SendState(gameState);
DeskillzSDK.Sync.OnStateReceived += (opponentState) => {
    UpdateOpponentState(opponentState);
};
```

---

## 9. Security Considerations

### Score Integrity

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Game Client │────▶│ SDK Encrypts│────▶│ Server      │
│ Score: 1500 │     │ + Signs     │     │ Validates   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                         ┌─────────────────────┴────────┐
                         ▼                              ▼
                  ┌─────────────┐              ┌─────────────┐
                  │ Valid:      │              │ Invalid:    │
                  │ Record score│              │ Flag user   │
                  └─────────────┘              └─────────────┘
```

### Platform Security Layers

1. **Smart Contract Audits** - Third-party audit before mainnet
2. **Rate Limiting** - API and wallet transaction limits
3. **KYC/AML** - For large withdrawals (regulatory compliance)
4. **2FA** - Optional but encouraged for high-value accounts
5. **Encryption** - All sensitive data encrypted at rest and in transit

---

## 10. Revenue Model

| Revenue Stream | Description | Fee |
|----------------|-------------|-----|
| Tournament Fee | Platform cut from prize pools | 5-15% |
| Developer Rev Share | Split of tournament fees | 70/30 (dev/platform) |
| Premium Features | Ad-free, early access, badges | Subscription |
| Sponsored Tournaments | Brands sponsor prize pools | Negotiated |

---

## 11. Implementation Phases

### Phase 1: MVP (8-10 weeks)
- [ ] Core React app with Tailwind
- [ ] Player authentication + wallet connection
- [ ] Game listing and detail pages
- [ ] Basic async tournament flow
- [ ] Score submission and leaderboard
- [ ] Prize distribution (manual initially)

### Phase 2: Full Tournament System (6-8 weeks)
- [ ] Sync mode (real-time multiplayer)
- [ ] Automated prize distribution via smart contracts
- [ ] Refund system for cancelled tournaments
- [ ] Player profiles and history

### Phase 3: Developer Platform (6-8 weeks)
- [ ] Developer portal
- [ ] Game upload and approval workflow
- [ ] SDK v1 release (Unity)
- [ ] Revenue tracking and payouts

### Phase 4: AI Integration (8-12 weeks)
- [ ] Fraud detection system
- [ ] Skill-based matchmaking
- [ ] Game recommendations
- [ ] Dynamic tournament creation

### Phase 5: Scale & Polish (Ongoing)
- [ ] Mobile apps (React Native)
- [ ] Unreal SDK
- [ ] Advanced analytics
- [ ] AI coaching insights

---

## 12. Folder Structure (Frontend)

```
src/
├── app/                    # App-level config, providers
│   ├── providers.tsx       # React Query, Web3, etc.
│   ├── router.tsx          # Route definitions
│   └── store.ts            # Zustand store
│
├── components/             # Shared UI components
│   ├── ui/                 # Primitives (Button, Card, Input)
│   ├── layout/             # Header, Footer, Sidebar
│   ├── game/               # GameCard, GameGrid, etc.
│   ├── tournament/         # TournamentCard, Leaderboard
│   └── wallet/             # WalletConnect, Balance
│
├── features/               # Feature modules
│   ├── auth/               # Login, register, wallet auth
│   ├── games/              # Game discovery, details
│   ├── tournaments/        # Tournament flows
│   ├── profile/            # Player dashboard
│   └── developer/          # Developer portal
│
├── hooks/                  # Custom React hooks
│   ├── useWallet.ts
│   ├── useTournament.ts
│   └── useGame.ts
│
├── lib/                    # Utilities
│   ├── api.ts              # API client
│   ├── web3.ts             # Web3 utilities
│   └── utils.ts            # Helpers
│
├── types/                  # TypeScript types
│   ├── game.ts
│   ├── tournament.ts
│   └── user.ts
│
└── styles/                 # Global styles
    └── globals.css         # Tailwind imports
```

---

## 13. Next Steps

1. **Validate this architecture** - Review and adjust based on your feedback
2. **Set up development environment** - Scaffold React + Vite + Tailwind
3. **Design system** - Create UI components and style guide
4. **API contract** - Define endpoints between frontend and backend
5. **Begin Phase 1 development**

---

*Document Version: 1.0*
*Last Updated: December 2024*
