# Deskillz SDK for Unity

Integrate competitive tournaments, real-time multiplayer, and cryptocurrency prizes into your Unity game with just 2 lines of code.

## Quick Start

### Installation

**Via Unity Package Manager:**
1. Open Window > Package Manager
2. Click + > Add package from git URL
3. Enter: `https://github.com/deskillz/unity-sdk.git`

**Via unitypackage:**
1. Download latest release from [deskillz.games/developer](https://deskillz.games/developer)
2. Import into your project

### Setup

1. Create config: Assets > Create > Deskillz > Config
2. Enter your API Key and Game ID (get from [deskillz.games/developer](https://deskillz.games/developer))
3. Place in Resources folder

### Basic Integration

```csharp
using Deskillz;

// When player finishes the game
Deskillz.SubmitScore(playerScore);
Deskillz.EndMatch();
```

That's it! The SDK handles everything else automatically.

## Features

- **Asynchronous Tournaments** - Players compete separately, scores compared after deadline
- **Real-time Multiplayer** - 2-10 players competing simultaneously
- **Custom Stages** - Player-created private rooms with custom rules
- **Cryptocurrency Prizes** - BTC, ETH, SOL, XRP, BNB, USDT, USDC
- **Built-in UI** - Pre-made UI components with customizable themes
- **Anti-Cheat** - Server-side validation and client protection
- **Offline Support** - Automatic score caching and retry

## Events

Subscribe to SDK events for full control:

```csharp
// SDK ready
DeskillzEvents.OnReady += () => Debug.Log("SDK Ready!");

// Match lifecycle
DeskillzEvents.OnMatchReady += (match) => LoadGame();
DeskillzEvents.OnMatchStart += (match) => StartGameplay();
DeskillzEvents.OnMatchComplete += (result) => ShowResults(result);

// Real-time multiplayer
DeskillzEvents.OnPlayerJoined += (player) => SpawnPlayer(player);
DeskillzEvents.OnMessageReceived += (msg) => HandleMessage(msg);
```

## Test Mode

Test your integration without real currency:

```csharp
// Starts automatically in Unity Editor
// Or enable manually in DeskillzConfig

// Start a test match
Deskillz.StartTestMatch(MatchMode.Asynchronous);

// Simulate opponent score
Deskillz.SimulateOpponentScore(1000);
```

## Documentation

- [Quick Start Guide](https://docs.deskillz.games/unity/quickstart)
- [API Reference](https://docs.deskillz.games/unity/api)
- [Multiplayer Guide](https://docs.deskillz.games/unity/multiplayer)
- [Custom UI Guide](https://docs.deskillz.games/unity/custom-ui)
- [Troubleshooting](https://docs.deskillz.games/unity/troubleshooting)

## Requirements

- Unity 2020.3 LTS or newer
- iOS 12.0+ / Android 5.0+
- .NET Standard 2.1

## Support

- Email: sdk@deskillz.games
- Discord: [discord.gg/deskillz](https://discord.gg/deskillz)
- Documentation: [docs.deskillz.games](https://docs.deskillz.games)

## License

Copyright © 2024 Deskillz.Games. All rights reserved.
