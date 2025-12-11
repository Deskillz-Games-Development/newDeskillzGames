# Deskillz SDK for Unreal Engine

[![SDK Version](https://img.shields.io/badge/SDK-v1.0.0-brightgreen.svg)](https://deskillz.games)
[![UE Version](https://img.shields.io/badge/Unreal-4.27%2B%20%7C%205.x-blue.svg)](https://unrealengine.com)
[![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20iOS%20%7C%20Android-orange.svg)](https://deskillz.games)

Turn your Unreal game into a competitive gaming platform with cryptocurrency prizes!

## 🚀 Quick Start (2 Minutes)

### Step 1: Install the Plugin
```
Copy "deskillz-unreal-sdk" folder → YourProject/Plugins/Deskillz/
```

### Step 2: Open Setup Wizard
When you open your project, the **Setup Wizard** launches automatically!

Or open manually: `Window → Deskillz → Setup Wizard`

### Step 3: Enter Credentials
- Get your **API Key** and **Game ID** from the [Developer Portal](https://deskillz.games/developer)
- The wizard guides you through each step

### Step 4: Integrate (Just 2 Blueprint Nodes!)

When your gameplay ends:

```
┌─────────────────────────┐     ┌─────────────────────────┐
│ Deskillz Submit Score   │────▶│ Deskillz End Match      │
│ Score: [Your Score]     │     │                         │
└─────────────────────────┘     └─────────────────────────┘
```

**That's it!** The SDK handles everything else automatically.

---

## 📋 Features

| Feature | Description |
|---------|-------------|
| **Zero-Config** | Auto-initializes, sensible defaults |
| **Guided Setup** | Step-by-step wizard in editor |
| **Blueprint Ready** | Full Blueprint support, no C++ required |
| **7 Cryptocurrencies** | BTC, ETH, SOL, XRP, BNB, USDT, USDC |
| **Real-time Multiplayer** | Sync and async match types |
| **Practice Mode** | Free play without entry fees |
| **Built-in UI** | Pre-made tournament, matchmaking, results screens |
| **Anti-Cheat** | Score encryption, memory protection |

---

## 🎮 Blueprint API Reference

### Most Common (Start Here!)

| Node | Description |
|------|-------------|
| `Deskillz Submit Score` | Submit final score when game ends |
| `Deskillz End Match` | Complete the match |
| `Is In Deskillz Match` | Check if in active tournament |
| `Get Match Time Remaining` | Seconds left in match |

### Match Flow

| Node | Description |
|------|-------------|
| `Deskillz Match Ready` | Signal game scene is loaded |
| `Update Score` | Update score during gameplay |
| `Abort Match` | Forfeit current match |
| `Get Match Random Seed` | Seed for deterministic gameplay |

### Tournaments

| Node | Description |
|------|-------------|
| `Show Tournaments` | Open tournament browser |
| `Join Tournament` | Enter a tournament |
| `Find Match` | Start matchmaking |
| `Cancel Matchmaking` | Stop searching |

### Practice Mode

| Node | Description |
|------|-------------|
| `Start Practice` | Begin free play session |
| `End Practice` | Finish practice |
| `Is In Practice` | Check if in practice mode |

### Player & Wallet

| Node | Description |
|------|-------------|
| `Get Current Player` | Your player info |
| `Get Opponent` | Opponent info in match |
| `Get Balance` | Wallet balance by currency |
| `Show Wallet` | Open wallet UI |

---

## 📦 File Structure

```
Plugins/Deskillz/
├── Deskillz.uplugin              # Plugin descriptor
├── Source/
│   ├── Deskillz/                 # Runtime module
│   │   ├── Public/
│   │   │   ├── Core/
│   │   │   │   ├── DeskillzSDK.h         # Main SDK class
│   │   │   │   ├── DeskillzConfig.h      # Configuration
│   │   │   │   ├── DeskillzTypes.h       # Data types & enums
│   │   │   │   └── DeskillzEvents.h      # Event system
│   │   │   └── Blueprints/
│   │   │       ├── DeskillzBlueprintLibrary.h  # Static Blueprint API
│   │   │       └── DeskillzManager.h     # Auto-spawn manager
│   │   └── Private/              # Implementations
│   │
│   └── DeskillzEditor/           # Editor module
│       └── Public/
│           └── DeskillzSetupWizard.h     # Setup wizard
│
├── Content/
│   ├── Blueprints/               # Pre-made Blueprint actors
│   └── Widgets/                  # UMG widget Blueprints
│
└── README.md                     # This file
```

---

## ⚙️ Configuration

### Via Project Settings
`Edit → Project Settings → Plugins → Deskillz SDK`

| Setting | Default | Description |
|---------|---------|-------------|
| API Key | - | Your Deskillz API key |
| Game ID | - | Your game identifier |
| Environment | Sandbox | Sandbox or Production |
| Default Match Duration | 180s | Match time limit |
| Enable Practice Mode | ✓ | Allow free play |
| Auto Submit Scores | ✓ | Auto-submit on match end |
| Use Built-in UI | ✓ | Show Deskillz UI |

### Via C++ (Optional)
```cpp
// In your GameMode or anywhere after BeginPlay
UDeskillzSDK* SDK = UDeskillzSDK::Get(this);
SDK->InitializeWithCredentials("API_KEY", "GAME_ID", EDeskillzEnvironment::Sandbox);
```

---

## 🎯 Integration Examples

### Example 1: Submit Score (Minimal)
```
// In your EndGame event or function:

[Event: Game Over]
        │
        ▼
┌─────────────────────────┐
│ Deskillz Submit Score   │
│ Score: [FinalScore]     │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ Deskillz End Match      │
└─────────────────────────┘
```

### Example 2: Check If Tournament Match
```
[Event: Begin Play]
        │
        ▼
┌─────────────────────────┐
│ Is In Deskillz Match    │──▶ True: Enable tournament features
└─────────────────────────┘──▶ False: Normal gameplay
```

### Example 3: Match Timer Display
```
[Event: Tick]
        │
        ▼
┌─────────────────────────┐
│ Get Match Time Remaining│──▶ Update UI text
└─────────────────────────┘
```

### Example 4: Use Random Seed (Fair Play)
```
[Event: Match Start]
        │
        ▼
┌─────────────────────────┐
│ Get Match Random Seed   │──▶ Set Random Seed
└─────────────────────────┘
```

---

## 🔧 Events (Blueprint Assignable)

Bind to these in your Level Blueprint or Actor:

| Event | Fires When |
|-------|------------|
| `On SDK Initialized` | SDK ready (or failed) |
| `On Match Ready` | Opponent found, match starting |
| `On Gameplay Start` | Start your game timer! |
| `On Match Completed` | Results available |
| `On Match Time Update` | Every second during match |
| `On Error` | Something went wrong |

---

## 🛡️ Security Features

- **Score Encryption**: AES-256-GCM encryption
- **HMAC Validation**: Tamper-proof score verification
- **Memory Protection**: Anti-cheat memory scanning
- **Replay Detection**: Duplicate submission prevention
- **Device Fingerprinting**: Unique device identification

---

## 💰 Supported Cryptocurrencies

| Currency | Symbol | Type |
|----------|--------|------|
| Bitcoin | BTC | Native |
| Ethereum | ETH | Native |
| Solana | SOL | Native |
| Ripple | XRP | Native |
| Binance Coin | BNB | Token |
| Tether | USDT | Stablecoin |
| USD Coin | USDC | Stablecoin |

---

## 📱 Platform Support

| Platform | Status |
|----------|--------|
| Windows | ✅ Supported |
| macOS | ✅ Supported |
| Linux | ✅ Supported |
| iOS | ✅ Supported |
| Android | ✅ Supported |

---

## 🆘 Support

- **Documentation**: [docs.deskillz.games/unreal](https://docs.deskillz.games/unreal)
- **Developer Portal**: [deskillz.games/developer](https://deskillz.games/developer)
- **Support**: [support.deskillz.games](https://support.deskillz.games)
- **Discord**: Join our developer community

---

## 📄 License

© 2024 Deskillz Games. All rights reserved.

---

**Ready to make your game competitive? Let's go! 🎮🏆💰**
