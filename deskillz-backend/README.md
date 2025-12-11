# Deskillz.games Backend

NestJS backend for the Deskillz.games Web3 competitive gaming platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **pgAdmin** on port 5050 (optional GUI)
- **Redis Commander** on port 8081 (optional GUI)

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

Server runs at: http://localhost:3001

## 📚 API Documentation

Swagger docs available at: http://localhost:3001/docs

## 🏗️ Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── guards/          # Auth guards
│   ├── filters/         # Exception filters
│   └── interceptors/    # Request interceptors
├── config/              # Configuration
├── gateway/             # Socket.io gateway
├── modules/             # Feature modules
│   ├── auth/            # JWT + Wallet auth
│   ├── users/           # User management
│   ├── games/           # Game CRUD
│   ├── tournaments/     # Tournament lifecycle
│   ├── wallet/          # Crypto transactions
│   ├── leaderboard/     # Rankings
│   └── developer/       # Developer portal
└── prisma/              # Database client
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_HOST` | Redis host |
| `JWT_SECRET` | JWT signing secret |
| `SIWE_DOMAIN` | Domain for wallet auth |

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server |
| `npm run start:prod` | Start production server |
| `npm run build` | Build for production |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:migrate` | Run database migrations |
| `npm run db:reset` | Reset database |

## 🔌 WebSocket Events

### Client → Server

| Event | Description |
|-------|-------------|
| `matchmaking:join` | Join matchmaking queue |
| `matchmaking:leave` | Leave matchmaking queue |
| `tournament:join` | Join tournament room |
| `game:action` | Send game action |
| `game:score` | Submit score update |

### Server → Client

| Event | Description |
|-------|-------------|
| `connected` | Connection successful |
| `match:found` | Match found |
| `game:action` | Game action from player |
| `game:score_update` | Score update |
| `notification` | User notification |

## 🛡️ Authentication Flow

1. **Get Nonce**: `GET /api/v1/auth/nonce?walletAddress=0x...`
2. **Sign Message**: Sign SIWE message with wallet
3. **Verify**: `POST /api/v1/auth/wallet/verify` with message + signature
4. **Use Token**: Include `Authorization: Bearer <token>` in requests

## 📊 Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Access pgAdmin
open http://localhost:5050
# Email: admin@deskillz.games
# Password: admin
```

## 🚢 Deployment

```bash
# Build
npm run build

# Run migrations in production
npm run prisma:migrate:prod

# Start
npm run start:prod
```

## 📝 License

MIT
