# Deskillz.games - Platform Architecture & Design Document

## Executive Summary

Deskillz.games is a Web3-powered competitive gaming platform where players compete in skill-based tournaments using TRON USDT, and game developers monetize their Unity/Unreal games through an SDK integration and revenue-sharing model.

---

## 1. Technology Stack

### Frontend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **Next.js 14** (App Router) | SSR for SEO, API routes, excellent performance |
| Language | **TypeScript** | Type safety, better DX, fewer runtime bugs |
| Styling | **Tailwind CSS + shadcn/ui** | Modern, customizable, consistent design system |
| State | **Zustand** + **TanStack Query** | Lightweight global state + powerful data fetching/caching |
| Web3 | **wagmi + viem** | Modern React hooks for wallet connections |
| TRON | **TronWeb** | TRON-specific blockchain interactions |
| Real-time | **Socket.io client** | Live tournament updates, leaderboards |
| Charts | **Recharts** or **Tremor** | Analytics dashboards |
| Animations | **Framer Motion** | Polished micro-interactions |

### Backend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | **Node.js + Fastify** or **Go** | High performance, low latency |
| Database | **PostgreSQL** | Relational data, transactions, reliability |
| Cache | **Redis** | Leaderboards, session management, real-time |
| Queue | **BullMQ** | Tournament finalization, refund processing |
| Real-time | **Socket.io** | Live score updates, notifications |
| File Storage | **AWS S3 / Cloudflare R2** | Game file hosting, assets |
| CDN | **Cloudflare** | Global distribution of game files |

### Blockchain / Web3
| Component | Technology |
|-----------|------------|
| Network | **TRON Mainnet** (TRC-20 USDT) |
| Smart Contracts | **Solidity** (TRON-compatible) |
| Wallets | TronLink, MetaMask (with TRON), WalletConnect, Trust Wallet |
| Escrow | Custom smart contract for tournament prize pools |

### AI/ML Infrastructure
| Component | Technology |
|-----------|------------|
| ML Platform | **Python + FastAPI** microservice |
| Models | **scikit-learn**, **PyTorch** |
| Vector DB | **Pinecone** or **Qdrant** (for recommendations) |
| Monitoring | **MLflow** for model versioning |

---

## 2. Platform Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
├──────────────────┬──────────────────┬──────────────────┬────────────┤
│   Web App        │  Mobile Games    │  Developer       │   Admin    │
│   (Next.js)      │  (Unity/Unreal)  │  Portal          │   Panel    │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴─────┬──────┘
         │                  │                  │               │
         ▼                  ▼                  ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                  │
│                            (Cloudflare / nginx)                      │
└────────┬─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           CORE SERVICES                              │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│  Auth Service   │  Game Service   │ Tournament      │  Payment      │
│  (JWT + Web3)   │  (CRUD, SDK)    │ Service         │  Service      │
├─────────────────┼─────────────────┼─────────────────┼───────────────┤
│  User Service   │  Leaderboard    │  Notification   │  AI/ML        │
│  (Profiles)     │  Service        │  Service        │  Service      │
└─────────────────┴─────────────────┴─────────────────┴───────────────┘
         │                  │                  │               │
         ▼                  ▼                  ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                 │
├──────────────────┬──────────────────┬──────────────────┬────────────┤
│   PostgreSQL     │     Redis        │    S3/R2         │  TRON      │
│   (Primary DB)   │   (Cache/RT)     │  (Game Files)    │ Blockchain │
└──────────────────┴──────────────────┴──────────────────┴────────────┘
```

---

## 3. Page Structure & User Flows

### 3.1 Public Pages (Unauthenticated)

| Page | Purpose | Key Components |
|------|---------|----------------|
| `/` | Landing page | Hero, featured tournaments, top games, how it works, CTA |
| `/games` | Game catalog | Filterable grid, search, categories, popularity sorting |
| `/games/[slug]` | Game detail | Screenshots, description, tournament history, download links |
| `/tournaments` | Browse tournaments | Active/upcoming tournaments, filters, entry fees |
| `/how-it-works` | Platform explainer | Step-by-step guide, SDK info, fee structure |
| `/developers` | Developer landing | SDK benefits, revenue share info, signup CTA |
| `/leaderboards` | Global rankings | Top players, earnings, win rates |

### 3.2 Player Portal (Authenticated)

| Page | Purpose | Key Components |
|------|---------|----------------|
| `/dashboard` | Player home | Active tournaments, recent games, earnings summary, AI recommendations |
| `/wallet` | Wallet management | Connect wallet, balance, deposit/withdraw USDT, transaction history |
| `/tournaments/[id]` | Tournament lobby | Entry, live scores, countdown, players list, chat |
| `/tournaments/[id]/play` | Game launch | Deep link to installed game with session token |
| `/history` | Tournament history | Past tournaments, results, earnings breakdown |
| `/profile` | Player profile | Stats, badges, public profile, settings |
| `/profile/[username]` | Public profile | View other players' stats, head-to-head history |
| `/cashout` | Withdrawal | Select wallet, amount, confirm, transaction status |

### 3.3 Developer Portal

| Page | Purpose | Key Components |
|------|---------|----------------|
| `/dev` | Developer dashboard | Revenue overview, active games, player stats |
| `/dev/games` | Game management | List of uploaded games, status, actions |
| `/dev/games/new` | Upload game | File upload, metadata, SDK version, pricing settings |
| `/dev/games/[id]` | Game analytics | Player count, revenue, tournament performance, retention |
| `/dev/payouts` | Revenue & payouts | Earnings history, pending payouts, payout requests |
| `/dev/sdk` | SDK documentation | Integration guides, API reference, sample code |
| `/dev/settings` | Developer settings | Company info, payout wallet, team members |

### 3.4 Admin Panel

| Page | Purpose |
|------|---------|
| `/admin` | Overview dashboard |
| `/admin/users` | User management, bans, verification |
| `/admin/games` | Game approval queue, moderation |
| `/admin/tournaments` | Tournament management, dispute resolution |
| `/admin/finance` | Platform revenue, fee tracking, payouts |
| `/admin/ai` | ML model monitoring, fraud alerts |

---

## 4. AI/ML Integration Strategy

### 4.1 Player-Facing AI Features

#### Smart Matchmaking
```
Problem: Unfair matches = player frustration = churn
Solution: ML-based skill rating system

- Hidden MMR (Matchmaking Rating) calculated from:
  - Win/loss ratio per game
  - Score percentiles
  - Opponent difficulty
  - Recent performance trend
  
- Tournament brackets balanced by skill tier
- Synchronous matches pair similar skill levels
```

#### Personalized Game Recommendations
```
Algorithm: Collaborative filtering + content-based hybrid

Inputs:
- Games played and time spent
- Tournament entry patterns
- Similar players' preferences
- Game metadata (genre, difficulty, style)

Output: "Recommended for you" carousel on dashboard
```

#### Dynamic Tournament Suggestions
```
"Perfect tournaments for you right now"

Factors:
- Player's available balance
- Historical entry fee preferences
- Games they've played recently
- Tournament fill rate predictions
- Time until expiration
```

#### AI Play Coach (Premium Feature)
```
Post-game analysis:
- "Your score was in the top 15% for this game"
- "Players who improved fastest practiced X pattern"
- "Suggested: Try Tournament Y - you'd rank well"
```

### 4.2 Platform Integrity AI

#### Fraud & Cheat Detection
```
Real-time scoring anomaly detection:

- Statistical outlier detection on scores
- Impossible score patterns (too consistent, inhuman reaction times)
- Device fingerprinting for multi-accounting
- Behavioral biometrics (play patterns)

Action: Flag for review, temporary hold on payouts
```

#### Bot Detection
```
Identify automated/bot players:

- Input pattern analysis from SDK telemetry
- Session behavior (instant joins, perfect timing)
- Network fingerprinting

Action: Shadow ban, prevent tournament entry
```

#### Collusion Detection
```
Detect coordinated play:

- Players who frequently appear in same tournaments
- Suspicious loss patterns (intentional losing)
- Wallet connection analysis

Action: Alert admins, freeze accounts pending review
```

### 4.3 Developer-Facing AI

#### Revenue Optimization
```
"Your game performs 40% better in evening tournaments"
"Suggested entry fee: $2-5 based on player behavior"
"Players drop off at level 3 - consider difficulty adjustment"
```

#### Churn Prediction
```
Identify at-risk players per game:
- Declining play frequency
- Shorter session times
- Negative balance trend

Action: Trigger re-engagement (notifications, bonuses)
```

### 4.4 Platform Operations AI

#### Dynamic Pricing
```
Tournament entry fees adjusted by:
- Demand prediction
- Time of day
- Player pool size
- Historical fill rates
```

#### Smart Refund Processing
```
Auto-categorize refund requests:
- Technical issues → auto-approve
- Dispute → route to human
- Suspicious → flag for review
```

---

## 5. Database Schema (Core Tables)

```sql
-- Users & Auth
users (id, wallet_address, username, email, avatar_url, created_at, status)
user_wallets (id, user_id, wallet_type, address, is_primary)
user_stats (user_id, total_earnings, total_tournaments, win_rate, mmr)

-- Games
games (id, developer_id, name, slug, description, icon_url, status, platform)
game_files (id, game_id, platform, version, file_url, sdk_version)
game_analytics (game_id, date, plays, unique_players, revenue)

-- Tournaments
tournaments (id, game_id, mode, entry_fee, prize_pool, max_players, 
             starts_at, expires_at, status, winner_id)
tournament_entries (id, tournament_id, user_id, score, submitted_at, rank)
tournament_transactions (id, tournament_id, user_id, type, amount, tx_hash)

-- Developers
developers (id, user_id, company_name, payout_wallet, revenue_share_pct)
developer_payouts (id, developer_id, amount, status, tx_hash, created_at)

-- AI/ML
player_recommendations (user_id, game_id, score, reason, created_at)
fraud_alerts (id, user_id, tournament_id, alert_type, confidence, status)
player_mmr_history (user_id, game_id, mmr, calculated_at)
```

---

## 6. Smart Contract Architecture

### Tournament Escrow Contract
```solidity
// Simplified structure
contract DeskillzTournament {
    struct Tournament {
        uint256 id;
        uint256 entryFee;
        uint256 prizePool;
        uint256 platformFee; // e.g., 10%
        uint256 expiresAt;
        address[] players;
        bool finalized;
    }
    
    // Player enters tournament
    function enterTournament(uint256 tournamentId) external;
    
    // Backend calls after expiration with verified winner
    function finalizeTournament(uint256 tournamentId, address winner) external onlyOracle;
    
    // Auto-refund if not enough players
    function refundTournament(uint256 tournamentId) external;
    
    // Player withdrawal
    function withdraw() external;
}
```

### Revenue Share Contract
```solidity
contract DeskillzRevenue {
    // Distribute platform fees to developers based on their game's contribution
    function distributeRevenue(address[] developers, uint256[] shares) external;
    
    // Developer claims accumulated earnings
    function claimEarnings() external;
}
```

---

## 7. SDK Architecture (Unity/Unreal)

### SDK Features
```
DeskillzSDK
├── Authentication
│   ├── InitSession(token)      // Receive session from app launch
│   └── GetPlayerInfo()         // Current player data
│
├── Tournament
│   ├── GetCurrentTournament()  // Active tournament details
│   ├── SubmitScore(score)      // Send final score
│   └── GetLeaderboard()        // Current standings
│
├── Analytics
│   ├── TrackEvent(name, data)  // Custom events
│   └── TrackPlayTime()         // Auto session tracking
│
├── Anti-Cheat
│   ├── ValidateScore(score, proof)  // Score verification
│   └── GetDeviceFingerprint()       // Device ID for fraud detection
│
└── UI Components
    ├── ShowLeaderboard()       // Native leaderboard overlay
    └── ShowTournamentEnd()     // Results screen
```

### Integration Flow
```
1. Developer downloads SDK
2. Imports into Unity/Unreal project
3. Implements IGameSession interface:
   - OnGameStart()
   - OnScoreUpdate(score)
   - OnGameEnd(finalScore)
4. Builds APK/IPA with SDK embedded
5. Uploads to Developer Portal
6. Platform validates SDK version & security
7. Game goes live after approval
```

---

## 8. Security Considerations

| Threat | Mitigation |
|--------|------------|
| Score manipulation | SDK-level encryption, server-side validation, ML anomaly detection |
| Multi-accounting | Device fingerprinting, wallet analysis, behavioral patterns |
| Tournament collusion | Graph analysis of player relationships, betting pattern detection |
| Wallet theft | Non-custodial design, users control their own wallets |
| DDoS | Cloudflare protection, rate limiting |
| Smart contract exploits | Professional audit, timelocks, multi-sig admin |

---

## 9. Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- [ ] Next.js project setup with TypeScript
- [ ] Design system with Tailwind + shadcn/ui
- [ ] Authentication (Web3 wallet + optional email)
- [ ] Core database schema
- [ ] Basic API routes

### Phase 2: Player Experience (Weeks 5-8)
- [ ] Game catalog and detail pages
- [ ] Tournament browsing and entry
- [ ] Wallet integration (TronLink, MetaMask)
- [ ] Player dashboard and history
- [ ] Real-time leaderboards

### Phase 3: Developer Portal (Weeks 9-12)
- [ ] Developer registration and verification
- [ ] Game upload and management
- [ ] SDK v1.0 for Unity
- [ ] Revenue tracking and payouts
- [ ] Documentation site

### Phase 4: Smart Contracts (Weeks 10-14)
- [ ] Tournament escrow contract
- [ ] Revenue distribution contract
- [ ] Security audit
- [ ] Testnet deployment and testing
- [ ] Mainnet launch

### Phase 5: AI/ML Integration (Weeks 13-18)
- [ ] Matchmaking algorithm
- [ ] Recommendation engine
- [ ] Fraud detection pipeline
- [ ] Player analytics dashboard
- [ ] Developer insights

### Phase 6: Polish & Scale (Weeks 19-24)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] SDK for Unreal Engine
- [ ] Advanced analytics
- [ ] Marketing site and SEO

---

## 10. Competitive Advantages with AI

| Feature | Traditional Platform | Deskillz.games with AI |
|---------|---------------------|------------------------|
| Matchmaking | Random or basic brackets | Skill-based, fair matches |
| Fraud | Manual review | Real-time ML detection |
| Recommendations | Static categories | Personalized suggestions |
| Developer insights | Basic metrics | Predictive analytics |
| Player retention | Generic notifications | Personalized re-engagement |
| Tournament pricing | Fixed | Dynamic optimization |

---

## 11. Estimated Tech Budget (Monthly at Scale)

| Service | Estimated Cost |
|---------|---------------|
| Vercel (hosting) | $150-500 |
| PostgreSQL (managed) | $200-800 |
| Redis (managed) | $100-300 |
| S3/R2 (game files) | $100-500 |
| AI/ML compute | $300-1000 |
| Blockchain RPCs | $100-300 |
| Monitoring (Datadog) | $200-500 |
| **Total** | **$1,150 - $3,900/mo** |

---

## Next Steps

1. **Confirm tech stack choices** - Any preferences or constraints?
2. **Prioritize features** - MVP scope vs full vision?
3. **Design mockups** - Want me to create UI wireframes?
4. **Start scaffolding** - I can generate the project structure

Ready to begin building when you are.
