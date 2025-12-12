# Deskillz Unreal Engine SDK

[![Unreal Engine](https://img.shields.io/badge/Unreal%20Engine-4.27%2B%20%7C%205.x-blue)](https://www.unrealengine.com/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20iOS%20%7C%20Android-green)](https://www.deskillz.games)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

The official Deskillz SDK for Unreal Engine enables game developers to integrate competitive skill-based tournaments with cryptocurrency prize pools into their games.

## 🎮 Features

### Core Features
- **Tournament Integration** - Browse, enter, and compete in skill-based tournaments
- **Matchmaking** - Automatic opponent matching based on skill rating
- **Real-time Multiplayer** - WebSocket-based synchronous gameplay support
- **Asynchronous Play** - Turn-based and score-attack game modes

### Security
- **AES-256-GCM Encryption** - Military-grade score encryption
- **HMAC-SHA256 Signatures** - Tamper-proof data integrity
- **Anti-Cheat System** - Speed hack detection, memory scanning prevention
- **Replay Attack Prevention** - Unique submission IDs with server validation

### Wallet & Payments
- **Multi-Currency Support** - BTC, ETH, SOL, XRP, BNB, USDT, USDC
- **Secure Transactions** - Deposit, withdraw, and prize distribution
- **Real-time Balance** - Live wallet balance updates

### Analytics & Telemetry
- **Event Tracking** - Comprehensive gameplay analytics
- **Performance Monitoring** - FPS, memory, latency metrics
- **A/B Testing** - Built-in experimentation framework

### Platform Integration
- **Deep Linking** - Custom URL schemes and universal links
- **Push Notifications** - Tournament reminders and match alerts
- **App Lifecycle** - Background/foreground state management

### UI Components
- **Pre-built Widgets** - Tournament list, matchmaking, results, wallet display
- **Customizable Themes** - Match your game's visual style
- **Blueprint Support** - Full visual scripting integration

## 📋 Requirements

- **Unreal Engine**: 4.27+ or 5.x
- **Platforms**: Windows, iOS, Android
- **C++ Standard**: C++17

## 🚀 Quick Start

### 1. Installation

Copy the SDK to your project's Plugins folder:

```
YourProject/
└── Plugins/
    └── Deskillz/
        ├── Deskillz.uplugin
        └── Source/
```

### 2. Configure SDK

```cpp
#include "Core/DeskillzSDK.h"

FDeskillzConfig Config;
Config.GameId = TEXT("your_game_id");
Config.ApiKey = TEXT("your_api_key");
Config.Environment = EDeskillzEnvironment::Sandbox;

UDeskillzSDK::Get()->Initialize(Config);
```

### 3. Enter Tournament & Submit Score

```cpp
// Start matchmaking
UDeskillzMatchmaking::Get()->StartMatchmaking(TournamentId, OnMatchFound);

// Submit score when game ends
UDeskillzSecureSubmitter::Get()->SubmitScore(Score, Duration, OnSubmitted);
```

## 📁 SDK Structure

| Module | Description | Files |
|--------|-------------|-------|
| **Core** | SDK lifecycle, configuration, events | 6 |
| **Match** | Tournament entry, matchmaking | 4 |
| **Security** | Encryption, anti-cheat | 8 |
| **Network** | HTTP, WebSocket, API | 8 |
| **Analytics** | Event tracking, telemetry | 6 |
| **Platform** | Device, deep links, notifications | 8 |
| **UI** | Pre-built UMG widgets | 18 |
| **Blueprints** | Visual scripting support | 4 |
| **Tests** | Unit & integration tests | 6 |

**Total: ~32,000 lines of C++ code**

## 💰 Supported Cryptocurrencies

| Currency | Symbol |
|----------|--------|
| Bitcoin | BTC |
| Ethereum | ETH |
| Solana | SOL |
| Ripple | XRP |
| BNB | BNB |
| Tether | USDT |
| USD Coin | USDC |

## 📚 Documentation

- [Quick Start Guide](Docs/QUICKSTART.md)
- [API Reference](Docs/API_REFERENCE.md)
- [Integration Guide](Docs/INTEGRATION_GUIDE.md)
- [Changelog](CHANGELOG.md)

## 🤝 Support

- **Documentation**: [docs.deskillz.games](https://docs.deskillz.games)
- **Developer Portal**: [developer.deskillz.games](https://developer.deskillz.games)
- **Email**: sdk-support@deskillz.games

---

**Deskillz** - Skill-Based Gaming with Crypto Prizes

© 2024 Deskillz Games. All rights reserved.
