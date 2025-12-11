import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AIKnowledgeCreateDto, AIKnowledgeUpdateDto, AIKnowledgeResponseDto } from './dto/ai.dto';
import { AIKnowledgeCategory } from '@prisma/client';

/**
 * AI Knowledge Service - Seeds SDK documentation on startup
 * 
 * Uses existing AIKnowledgeCategory enum values:
 *   PLAYER_GUIDE, DEVELOPER_SDK, TROUBLESHOOTING, FAQ, TOURNAMENT, WALLET, GENERAL
 * 
 * This service seeds 15 knowledge articles covering:
 *   - Platform overview (GENERAL)
 *   - Unity SDK Phases 1-6 (DEVELOPER_SDK)
 *   - Troubleshooting guides (DEVELOPER_SDK)
 *   - Wallet connection (WALLET)
 *   - Tournament mechanics (TOURNAMENT)
 */

interface KnowledgeSearchResult {
  id: string;
  title: string;
  content: string;
  category: AIKnowledgeCategory;
  similarity?: number;
}

@Injectable()
export class AIKnowledgeService implements OnModuleInit {
  private readonly logger = new Logger(AIKnowledgeService.name);
  private readonly openaiApiKey: string | undefined;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  async onModuleInit() {
    await this.seedKnowledgeBase();
  }

  async createKnowledge(dto: AIKnowledgeCreateDto): Promise<AIKnowledgeResponseDto> {
    const embedding = await this.generateEmbedding(dto.content);

    const knowledge = await this.prisma.aIKnowledgeBase.create({
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        tags: dto.tags || [],
        source: dto.source || null,
        embedding: embedding,
        isActive: true,
        timesUsed: 0,
        avgHelpfulness: 0,
      },
    });

    return this.mapToResponseDto(knowledge);
  }

  async getAllKnowledge(category?: string): Promise<AIKnowledgeResponseDto[]> {
    // Convert string to enum if provided
    const categoryEnum = category ? (category as AIKnowledgeCategory) : undefined;
    const where = categoryEnum ? { category: categoryEnum, isActive: true } : { isActive: true };
    const knowledge = await this.prisma.aIKnowledgeBase.findMany({
      where,
      orderBy: { timesUsed: 'desc' },
    });
    return knowledge.map(this.mapToResponseDto);
  }

  async incrementUsage(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    
    await this.prisma.aIKnowledgeBase.updateMany({
      where: { id: { in: ids } },
      data: { timesUsed: { increment: 1 } },
    });
  }

  async searchKnowledge(query: string, limit = 5): Promise<KnowledgeSearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    const allKnowledge = await this.prisma.aIKnowledgeBase.findMany({
      where: { isActive: true },
    });

    // Calculate similarity scores
    const results = allKnowledge
      .map((k) => ({
        id: k.id,
        title: k.title,
        content: k.content,
        category: k.category,
        similarity: this.cosineSimilarity(queryEmbedding, k.embedding as number[]),
      }))
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit);

    // Also do keyword search as fallback
    const queryLower = query.toLowerCase();
    const keywordMatches = allKnowledge.filter(
      (k) =>
        k.title.toLowerCase().includes(queryLower) ||
        k.content.toLowerCase().includes(queryLower) ||
        (k.tags as string[]).some((tag) => tag.toLowerCase().includes(queryLower)),
    );

    // Merge results, preferring semantic matches
    const merged = [...results];
    for (const km of keywordMatches) {
      if (!merged.find((r) => r.id === km.id)) {
        merged.push({
          id: km.id,
          title: km.title,
          content: km.content,
          category: km.category,
          similarity: 0.5, // Give keyword matches a base score
        });
      }
    }

    return merged.slice(0, limit);
  }

  async updateKnowledge(id: string, dto: AIKnowledgeUpdateDto): Promise<AIKnowledgeResponseDto> {
    const data: any = { ...dto };
    if (dto.content) {
      data.embedding = await this.generateEmbedding(dto.content);
    }

    const knowledge = await this.prisma.aIKnowledgeBase.update({
      where: { id },
      data,
    });

    return this.mapToResponseDto(knowledge);
  }

  async recordUsage(id: string, wasHelpful: boolean): Promise<void> {
    const knowledge = await this.prisma.aIKnowledgeBase.findUnique({
      where: { id },
    });

    if (knowledge) {
      const newTimesUsed = knowledge.timesUsed + 1;
      const helpfulCount = knowledge.avgHelpfulness * knowledge.timesUsed + (wasHelpful ? 1 : 0);
      const newAvgHelpfulness = helpfulCount / newTimesUsed;

      await this.prisma.aIKnowledgeBase.update({
        where: { id },
        data: {
          timesUsed: newTimesUsed,
          avgHelpfulness: newAvgHelpfulness,
        },
      });
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openaiApiKey) {
      return [];
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.slice(0, 8000),
        }),
      });

      const data = await response.json();
      return data.data?.[0]?.embedding || [];
    } catch (error) {
      this.logger.error('Failed to generate embedding', error);
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length === 0 || b.length === 0 || a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private mapToResponseDto(knowledge: any): AIKnowledgeResponseDto {
    return {
      id: knowledge.id,
      title: knowledge.title,
      content: knowledge.content,
      category: knowledge.category,
      tags: knowledge.tags,
      isActive: knowledge.isActive,
      timesUsed: knowledge.timesUsed,
      avgHelpfulness: knowledge.avgHelpfulness,
      createdAt: knowledge.createdAt,
      updatedAt: knowledge.updatedAt,
    };
  }

  private async seedKnowledgeBase(): Promise<void> {
    const existingCount = await this.prisma.aIKnowledgeBase.count();
    if (existingCount > 0) {
      this.logger.log('Knowledge base already seeded');
      return;
    }

    this.logger.log('Seeding knowledge base with SDK documentation...');

    const knowledgeEntries = [
      // ==========================================
      // PLATFORM OVERVIEW
      // ==========================================
      {
        title: 'What is Deskillz.games',
        content: `Deskillz.games is a Web3-powered competitive gaming platform where players compete in skill-based tournaments for cryptocurrency prizes.

IMPORTANT: The website (deskillz.games) is an INFORMATIONAL portal only. All actual gameplay and tournaments happen INSIDE the mobile game apps.

What you can do on the WEBSITE:
- Browse and discover games available on the platform
- Download game apps (Android and iOS)
- View tournament schedules and leaderboards
- Manage your profile and connected wallets
- View your transaction history and winnings
- Access the Developer Portal (for game developers)

What you do in the GAME APPS:
- Join and enter tournaments
- Pay entry fees using cryptocurrency
- Play matches against other players
- Submit scores and compete for prizes
- Withdraw winnings to your wallet

The platform supports multiple cryptocurrencies: ETH, BTC, BNB, SOL, XRP, USDT, and USDC.`,
        category: AIKnowledgeCategory.GENERAL,
        tags: ['platform', 'overview', 'what is', 'about', 'deskillz'],
      },
      {
        title: 'Website vs Game App - Understanding the Difference',
        content: `The Deskillz platform has two parts:

1. WEBSITE (deskillz.games) - Information & Management
   - Browse available games
   - Download game apps to your phone
   - View leaderboards and tournament results
   - Manage your profile and wallet connections
   - Track your transaction history
   - Developer Portal for game creators

2. GAME APPS (Downloaded from app stores) - Actual Gameplay
   - This is where you PLAY the games
   - Join and enter tournaments (pay entry fees here)
   - Compete against other players in real matches
   - Submit your scores
   - Win and withdraw prizes

KEY POINT: You CANNOT play games on the website. The website is only for information and management. All gaming happens in the downloaded mobile apps.

Flow: Website → Download App → Open App → Join Tournament → Play → Win → Withdraw to Wallet`,
        category: AIKnowledgeCategory.GENERAL,
        tags: ['website', 'game app', 'difference', 'how to play'],
      },

      // ==========================================
      // UNITY SDK - OVERVIEW
      // ==========================================
      {
        title: 'Unity SDK Overview',
        content: `The Deskillz Unity SDK enables game developers to integrate their Unity games into the Deskillz competitive gaming platform.

SDK FEATURES:
- Tournament Integration: Entry fees, prize pools, matchmaking
- Cryptocurrency Payments: BTC, ETH, SOLANA, XRP, BNB, USDT, USDC
- Real-time Multiplayer: Synchronous player-vs-player
- Asynchronous Gameplay: Ghost races, turn-based
- Anti-Cheat: Score encryption, validation, memory protection
- Pre-Built UI: HUD, leaderboards, results screens
- Custom Stages: Private rooms with invite codes
- NPC System: Practice bots, ghost replays

SUPPORTED PLATFORMS:
- Unity 2020.3 LTS or newer
- iOS 12+
- Android API 21+
- WebGL (limited features)

SDK STRUCTURE:
deskillz-unity-sdk/
├── Runtime/
│   ├── Core/        (Initialization, config, events, networking)
│   ├── Match/       (Match lifecycle, state machine, timer)
│   ├── Score/       (Score tracking, encryption, validation)
│   ├── UI/          (HUD, leaderboard, results, notifications)
│   ├── Multiplayer/ (Real-time sync, lag compensation)
│   ├── Stage/       (Custom rooms, invite codes)
│   └── NPC/         (AI opponents, ghost replays)
├── Editor/          (Unity Editor tools)
└── package.json

Total SDK: 19,000+ lines of production-ready C# code`,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'overview', 'features', 'structure'],
      },

      // ==========================================
      // UNITY SDK - INSTALLATION
      // ==========================================
      {
        title: 'Unity SDK Installation Guide',
        content: `HOW TO INSTALL THE DESKILLZ UNITY SDK:

STEP 1: Import Package
1. Download deskillz-unity-sdk.zip from the Developer Portal
2. Extract to your Unity project's root folder
3. In Unity: Window → Package Manager → + → Add package from disk
4. Select deskillz-unity-sdk/package.json

STEP 2: Create Configuration
1. Right-click in Project → Create → Deskillz → Config
2. Set your API Key and Game ID (from developer portal)
3. Configure environment (Sandbox/Production)

STEP 3: Initialize in Code
\`\`\`csharp
using Deskillz;

public class GameBootstrap : MonoBehaviour
{
    void Start()
    {
        // Option A: Use config asset
        Deskillz.Initialize();
        
        // Option B: Pass credentials directly
        Deskillz.Initialize("your-api-key", "your-game-id");
    }
}
\`\`\`

STEP 4: Add Manager to Scene
Create empty GameObject → Add Component → DeskillzManager

Or let it auto-create:
\`\`\`csharp
DeskillzManager.Instance.Initialize();
\`\`\`

COMMON INSTALLATION ISSUES:
- "DeskillzManager not found": Make sure you added the package via Package Manager
- "API Key invalid": Check your credentials in the Developer Portal
- "Assembly reference error": Ensure Deskillz.SDK.asmdef is properly imported`,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'installation', 'setup', 'import', 'package'],
      },

      // ==========================================
      // UNITY SDK - INTEGRATION WORKFLOW
      // ==========================================
      {
        title: 'Unity SDK Integration Workflow',
        content: `HOW TO INTEGRATE YOUR GAME WITH DESKILLZ SDK:

MINIMUM INTEGRATION (Score-based game):
\`\`\`csharp
using Deskillz;
using Deskillz.Match;
using Deskillz.Score;

public class MyGame : MonoBehaviour
{
    void OnEnable()
    {
        DeskillzEvents.OnMatchStart += HandleMatchStart;
        DeskillzEvents.OnMatchComplete += HandleMatchComplete;
    }
    
    void OnDisable()
    {
        DeskillzEvents.OnMatchStart -= HandleMatchStart;
        DeskillzEvents.OnMatchComplete -= HandleMatchComplete;
    }
    
    void HandleMatchStart(MatchData match)
    {
        StartGame(); // Your game start logic
    }
    
    void HandleMatchComplete(MatchResult result)
    {
        Debug.Log($"Outcome: {result.Outcome}, Prize: {result.PrizeWon}");
    }
    
    // Call when player scores
    public void AddPoints(int points)
    {
        ScoreManager.Instance.AddScore(points);
    }
    
    // Call when game ends
    public void GameOver()
    {
        MatchController.Instance.EndMatch();
    }
}
\`\`\`

EVENT FLOW:
1. Player Opens Game
2. Deskillz.Initialize(apiKey, gameId)
3. OnInitialized event fires
4. Player enters matchmaking/tournament
5. OnMatchReady event fires (MatchData received)
6. OnMatchCountdown (3, 2, 1...)
7. OnMatchStart event fires
8. Gameplay begins
9. ScoreManager.AddScore() for each point
10. OnLocalScoreUpdated fires
11. MatchController.EndMatch() when done
12. ScoreManager.SubmitFinalScore() (auto-called)
13. OnMatchComplete event fires (MatchResult received)
14. Results screen shown
15. Deskillz.ReturnToApp()`,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'integration', 'workflow', 'events', 'flow'],
      },

      // ==========================================
      // UNITY SDK - CORE SYSTEM
      // ==========================================
      {
        title: 'Unity SDK Core System (Phase 1)',
        content: `CORE SYSTEM COMPONENTS:

FILES (9 files, 4,861 lines):
- Deskillz.cs: Static API facade
- DeskillzManager.cs: Main singleton controller
- DeskillzConfig.cs: Configuration ScriptableObject
- DeskillzEvents.cs: Event definitions and dispatcher
- DeskillzNetwork.cs: HTTP/WebSocket networking
- DeskillzCache.cs: Local data persistence
- DeskillzLogger.cs: Debug logging with levels
- DeskillzModels.cs: Data models (Player, Match, etc.)
- DeskillzEnums.cs: Enumerations

DESKILLZ STATIC API:
\`\`\`csharp
// Initialize
Deskillz.Initialize(apiKey, gameId);
Deskillz.Initialize(); // Uses config asset

// Properties
Deskillz.IsInitialized    // bool
Deskillz.CurrentPlayer    // PlayerData
Deskillz.CurrentMatch     // MatchData
Deskillz.TestMode         // bool

// Methods
Deskillz.ReturnToApp();   // Exit to Deskillz app
Deskillz.Logout();        // Clear session
\`\`\`

DESKILLZ EVENTS:
\`\`\`csharp
// Initialization
DeskillzEvents.OnInitialized
DeskillzEvents.OnInitializationFailed

// Match lifecycle
DeskillzEvents.OnMatchReady
DeskillzEvents.OnMatchCountdown
DeskillzEvents.OnMatchStart
DeskillzEvents.OnMatchComplete
DeskillzEvents.OnMatchPaused
DeskillzEvents.OnMatchResumed

// Score
DeskillzEvents.OnLocalScoreUpdated
DeskillzEvents.OnOpponentScoreUpdated

// Multiplayer
DeskillzEvents.OnPlayerJoined
DeskillzEvents.OnPlayerLeft
DeskillzEvents.OnConnectionStateChanged

// Errors
DeskillzEvents.OnError
\`\`\`

DESKILLZ CONFIG:
\`\`\`csharp
[CreateAssetMenu(menuName = "Deskillz/Config")]
public class DeskillzConfig : ScriptableObject
{
    public string ApiKey;
    public string GameId;
    public DeskillzEnvironment Environment; // Sandbox/Production
    public bool EnableLogging;
    public LogLevel LogLevel;
    public float NetworkTimeout;
    public int MaxRetries;
    public ScoreType ScoreType; // HigherIsBetter/LowerIsBetter
}
\`\`\``,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'core', 'initialization', 'events', 'config', 'phase 1'],
      },

      // ==========================================
      // UNITY SDK - MATCH SYSTEM
      // ==========================================
      {
        title: 'Unity SDK Match System (Phase 2)',
        content: `MATCH SYSTEM COMPONENTS:

FILES (5 files, 2,343 lines):
- MatchController.cs: Match lifecycle manager
- MatchStateMachine.cs: State transitions
- MatchTimer.cs: Countdown and gameplay timer
- MatchRound.cs: Multi-round support
- MatchExtensions.cs: Helper methods

MATCH STATES:
None → Initializing → Ready → Countdown → Playing → Paused → Ended

Terminal states: Completed, Cancelled, Forfeited

VALID STATE TRANSITIONS:
- None → Initializing
- Initializing → Ready, Failed
- Ready → Countdown
- Countdown → Playing, Cancelled
- Playing → Paused, Ended
- Paused → Playing, Forfeited
- Ended → Completed

MATCH CONTROLLER API:
\`\`\`csharp
// Properties
MatchController.Instance.CurrentMatch      // MatchData
MatchController.Instance.IsMatchActive     // bool
MatchController.Instance.CurrentState      // MatchState
MatchController.Instance.TimeRemaining     // float (seconds)
MatchController.Instance.TimeElapsed       // float (seconds)
MatchController.Instance.CurrentRound      // int
MatchController.Instance.TotalRounds       // int
MatchController.Instance.IsTimedMatch      // bool

// Methods
MatchController.Instance.PauseMatch();
MatchController.Instance.ResumeMatch();
MatchController.Instance.EndMatch();
MatchController.Instance.ForfeitMatch();
MatchController.Instance.AddTime(seconds);    // Power-ups
MatchController.Instance.RemoveTime(seconds); // Penalties
\`\`\`

MATCH DATA MODEL:
\`\`\`csharp
public class MatchData
{
    public string MatchId;
    public string GameId;
    public MatchType Type;        // Head2Head, Tournament, Practice
    public decimal EntryFee;
    public string Currency;
    public decimal PrizePool;
    public int TimeLimitSeconds;
    public int Rounds;
    public int CurrentRound;
    public bool IsRealtime;
    public List<MatchPlayer> Players;
    public int LocalPlayerScore;
}
\`\`\`

MATCH RESULT MODEL:
\`\`\`csharp
public class MatchResult
{
    public string MatchId;
    public MatchOutcome Outcome;  // Win, Loss, Tie, Forfeit, Pending
    public int FinalScore;
    public int FinalRank;
    public decimal PrizeWon;
    public string Currency;
    public int XpEarned;
    public TimeSpan Duration;
    public List<MatchPlayer> FinalStandings;
}
\`\`\``,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'match', 'controller', 'state', 'timer', 'phase 2'],
      },

      // ==========================================
      // UNITY SDK - SCORE SYSTEM
      // ==========================================
      {
        title: 'Unity SDK Score System (Phase 3)',
        content: `SCORE SYSTEM COMPONENTS:

FILES (4 files, 2,196 lines):
- ScoreManager.cs: Score tracking and submission
- ScoreEncryption.cs: AES-256-GCM encryption
- ScoreValidator.cs: Anti-cheat validation
- ScoreExtensions.cs: ProtectedScore, formatters

SCORE MANAGER API:
\`\`\`csharp
// Properties
ScoreManager.Instance.CurrentScore     // int
ScoreManager.Instance.HighScore        // int
ScoreManager.Instance.IsSubmitting     // bool

// Score operations
ScoreManager.Instance.SetScore(score);
ScoreManager.Instance.AddScore(points);
ScoreManager.Instance.SubtractScore(points);
ScoreManager.Instance.MultiplyScore(multiplier);
ScoreManager.Instance.ResetScore();

// Submission
ScoreManager.Instance.SubmitCheckpoint();   // During match
ScoreManager.Instance.SubmitFinalScore();   // End of match (auto-called)

// Events
ScoreManager.Instance.OnScoreChanged += (oldScore, newScore) => { };
\`\`\`

SCORE SECURITY FEATURES:

1. ENCRYPTION (ScoreEncryption):
- AES-256-GCM encryption
- HMAC-SHA256 payload signing
- PBKDF2 key derivation
- Keys derived from: matchId + sessionToken + apiKey

2. VALIDATION (ScoreValidator):
- Rate limiting: Max 1000 points/second
- Single increase cap: Max 10000 per action
- Pattern detection: Flags suspicious behavior
- Input correlation: Validates scores against player actions

\`\`\`csharp
// Configure validation
ScoreValidator.Instance.MaxScorePerSecond = 500;
ScoreValidator.Instance.MaxSingleIncrease = 5000;

// Record player actions for correlation
ScoreValidator.Instance.RecordInput();   // When player presses button
ScoreValidator.Instance.RecordAction();  // When game action occurs
\`\`\`

3. PROTECTED SCORE (Memory Protection):
\`\`\`csharp
// Use instead of int for score variables
ProtectedScore myScore = 0;
myScore += 100;      // Operators work normally
myScore *= 2;
int value = myScore; // Implicit conversion

// Detects memory tampering
// Raises AntiCheatViolation event if modified externally
\`\`\`

SCORE DISPLAY UTILITIES:
\`\`\`csharp
ScoreDisplay.Format(1500000);        // "1,500,000"
ScoreDisplay.FormatCompact(1500000); // "1.5M"
ScoreDisplay.GetOrdinal(1);          // "1st"
ScoreDisplay.GetOrdinal(2);          // "2nd"
\`\`\``,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'score', 'encryption', 'anticheat', 'validation', 'phase 3'],
      },

      // ==========================================
      // UNITY SDK - UI SYSTEM
      // ==========================================
      {
        title: 'Unity SDK UI System (Phase 4)',
        content: `UI SYSTEM COMPONENTS:

FILES (8 files, 3,484 lines):
- DeskillzUIManager.cs: Main UI controller
- DeskillzTheme.cs: Theme/styling system
- IDeskillzUI.cs: Custom UI interface
- UIPanel.cs: Base panel class
- MatchHUD.cs: In-game HUD
- LeaderboardUI.cs: Rankings display
- ResultsUI.cs: Match results
- UIComponents.cs: Countdown, notifications, pause

UI MANAGER API:
\`\`\`csharp
// HUD
DeskillzUIManager.Instance.ShowHUD();
DeskillzUIManager.Instance.HideHUD();
DeskillzUIManager.Instance.UpdateHUD(score, timeRemaining);

// Leaderboard
DeskillzUIManager.Instance.ShowLeaderboard(players);
DeskillzUIManager.Instance.HideLeaderboard();

// Results
DeskillzUIManager.Instance.ShowResults(matchResult);
DeskillzUIManager.Instance.HideResults();

// Notifications
DeskillzUIManager.Instance.ShowNotification("Message", NotificationType.Info);
DeskillzUIManager.Instance.ShowSuccess("You won!");
DeskillzUIManager.Instance.ShowError("Connection lost");
DeskillzUIManager.Instance.ShowWarning("Low time!");

// Pause menu
DeskillzUIManager.Instance.ShowPauseMenu();
DeskillzUIManager.Instance.HidePauseMenu();

// Theme
DeskillzUIManager.Instance.ApplyTheme(customTheme);
\`\`\`

THEME CUSTOMIZATION:
\`\`\`csharp
var theme = ScriptableObject.CreateInstance<DeskillzTheme>();
theme.PrimaryColor = new Color(0.2f, 0.6f, 1f);
theme.SecondaryColor = new Color(0.1f, 0.8f, 0.5f);
theme.BackgroundColor = new Color(0.1f, 0.1f, 0.15f);
theme.TextPrimary = Color.white;
theme.ScoreFontSize = 72;

DeskillzUIManager.Instance.ApplyTheme(theme);

// Or use presets
var darkTheme = DeskillzTheme.CreateDark();
var lightTheme = DeskillzTheme.CreateLight();
\`\`\`

CUSTOM UI IMPLEMENTATION:
\`\`\`csharp
// Implement your own UI
public class MyCustomUI : MonoBehaviour, IDeskillzUI
{
    public void ShowHUD() { /* Your code */ }
    public void HideHUD() { /* Your code */ }
    public void UpdateScore(int score) { /* Your code */ }
    public void UpdateTimer(float seconds) { /* Your code */ }
    public void ShowLeaderboard(List<MatchPlayer> players) { /* Your code */ }
    public void ShowResults(MatchResult result) { /* Your code */ }
    public void ShowCountdown(int seconds) { /* Your code */ }
}

// Register custom UI
DeskillzUIManager.Instance.SetCustomUI(myCustomUI);

// Revert to built-in
DeskillzUIManager.Instance.ClearCustomUI();
\`\`\``,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'ui', 'hud', 'leaderboard', 'results', 'theme', 'phase 4'],
      },

      // ==========================================
      // UNITY SDK - MULTIPLAYER SYSTEM
      // ==========================================
      {
        title: 'Unity SDK Multiplayer System (Phase 5)',
        content: `MULTIPLAYER SYSTEM COMPONENTS:

FILES (5 files, 2,778 lines):
- SyncManager.cs: Real-time multiplayer controller
- PlayerState.cs: State synchronization
- NetworkMessage.cs: Message types and serialization
- LagCompensation.cs: Prediction and reconciliation
- MultiplayerExtensions.cs: Helpers and utilities

SYNC MANAGER API:
\`\`\`csharp
// Properties
SyncManager.Instance.IsConnected      // bool
SyncManager.Instance.IsHost           // bool
SyncManager.Instance.LocalPlayerId    // string
SyncManager.Instance.PlayerCount      // int
SyncManager.Instance.Latency          // float (ms)
SyncManager.Instance.RemotePlayers    // Dictionary

// Connection
SyncManager.Instance.Connect(roomId, playerId, isHost);
SyncManager.Instance.Disconnect();

// Messaging
SyncManager.Instance.SendToAll(data);
SyncManager.Instance.SendToPlayer(playerId, data);
SyncManager.Instance.SendToHost(data);

// State sync
SyncManager.Instance.SetLocalState(playerState);
SyncManager.Instance.GetPlayerState<T>(playerId);
SyncManager.Instance.GetInterpolatedState(playerId);

// Events
SyncManager.Instance.OnConnected += () => { };
SyncManager.Instance.OnDisconnected += (reason) => { };
SyncManager.Instance.OnPlayerJoined += (player) => { };
SyncManager.Instance.OnPlayerLeft += (playerId) => { };
SyncManager.Instance.OnPlayerStateUpdated += (playerId, state) => { };
SyncManager.Instance.OnMessageReceived += (senderId, message) => { };
\`\`\`

PLAYER STATE:
\`\`\`csharp
var state = new PlayerState
{
    PlayerId = myId,
    Position = transform.position,
    Rotation = transform.rotation.eulerAngles,
    Velocity = rigidbody.velocity,
    Score = currentScore,
    Health = currentHealth,
    IsAlive = true,
    AnimationState = "running",
    InputMove = new Vector2(h, v),
    Inputs = InputFlags.Jump | InputFlags.Fire
};

SyncManager.Instance.SetLocalState(state);
\`\`\`

INPUT FLAGS:
\`\`\`csharp
[Flags]
public enum InputFlags
{
    None = 0,
    Jump = 1,
    Fire = 2,
    AltFire = 4,
    Reload = 8,
    Use = 16,
    Crouch = 32,
    Sprint = 64,
    Ability1 = 128,
    Ability2 = 256
}
\`\`\`

NETWORK TRANSFORM COMPONENT:
\`\`\`csharp
// Add to networked GameObjects for automatic sync
var netTransform = gameObject.AddComponent<NetworkTransform>();
netTransform.Initialize(playerId, isLocal);
netTransform.syncPosition = true;
netTransform.syncRotation = true;
netTransform.interpolationSpeed = 15f;
netTransform.snapThreshold = 3f;
\`\`\`

LAG COMPENSATION:
\`\`\`csharp
// Check network quality
float latency = SyncManager.Instance.Latency;
string quality = LagCompensation.GetNetworkQualityText(); // "Excellent", "Good", etc.

// Lag-compensated hit detection
SyncManager.Instance.PerformLagCompensatedAction(clientTimestamp, () =>
{
    // Players are rewound to clientTimestamp
    if (Physics.Raycast(origin, direction, out hit))
    {
        // Hit detection at historical positions
    }
});
\`\`\``,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'multiplayer', 'sync', 'realtime', 'lag', 'phase 5'],
      },

      // ==========================================
      // UNITY SDK - CUSTOM STAGES
      // ==========================================
      {
        title: 'Unity SDK Custom Stages System (Phase 6)',
        content: `CUSTOM STAGES COMPONENTS:

FILES (5 files, 3,479 lines):
- StageManager.cs: Create/join/manage stages
- StageConfig.cs: Configuration and rules
- StageRoom.cs: Room state and players
- StageBrowserUI.cs: Browser and waiting room
- StageExtensions.cs: Helpers, filters, chat

STAGE MANAGER API:
\`\`\`csharp
// Properties
StageManager.Instance.CurrentStage    // StageRoom
StageManager.Instance.IsInStage       // bool
StageManager.Instance.IsHost          // bool
StageManager.Instance.PublicStages    // List<StageInfo>

// Create
StageManager.Instance.CreateStage(config, onSuccess, onError);
StageManager.Instance.CreateQuickStage(gameName, onSuccess, onError);

// Join
StageManager.Instance.JoinByCode(inviteCode, onSuccess, onError);
StageManager.Instance.JoinStage(stageId, onSuccess, onError);

// Leave
StageManager.Instance.LeaveStage(onSuccess, onError);

// Host controls
StageManager.Instance.StartStage(onSuccess, onError);
StageManager.Instance.KickPlayer(playerId, reason, onSuccess, onError);
StageManager.Instance.CancelStage(reason, onSuccess, onError);
StageManager.Instance.UpdateConfig(newConfig, onSuccess, onError);

// Player actions
StageManager.Instance.SetReady(ready, onSuccess, onError);

// Browsing
StageManager.Instance.RefreshStageList(onSuccess, onError);
StageManager.Instance.StartAutoRefresh(intervalSeconds);
StageManager.Instance.StopRefreshing();

// Invite
StageManager.Instance.GetInviteLink();   // "https://deskillz.games/join/ABC123"
StageManager.Instance.CopyInviteCode();  // Copies to clipboard
\`\`\`

STAGE CONFIGURATION:
\`\`\`csharp
var config = new StageConfig
{
    Name = "My Tournament",
    GameId = "my-game",
    MinPlayers = 2,
    MaxPlayers = 8,
    EntryFee = 5.00m,
    Currency = "USDT",
    GameMode = StageGameMode.Synchronous,
    Visibility = StageVisibility.Private,
    TimeLimitSeconds = 300,
    Rounds = 3,
    PrizeDistribution = PrizeDistribution.TopThree,
    SkillRestricted = true,
    MinElo = 1000,
    MaxElo = 2000,
    AutoStart = true,
    AutoStartCountdown = 10
};
\`\`\`

STAGE PRESETS:
\`\`\`csharp
var casual = StagePresets.Casual("MyGame");
var competitive = StagePresets.Competitive("MyGame", 10m, "USDT");
var party = StagePresets.Party("MyGame");
var highStakes = StagePresets.HighStakes("MyGame", 100m, "USDT");
\`\`\`

STAGE VISIBILITY OPTIONS:
- Private: Only joinable via invite code
- Public: Visible in stage browser
- FriendsOnly: Only friends can see/join
- Unlisted: Not in browser, but link works

PRIZE DISTRIBUTION OPTIONS:
- WinnerTakesAll: 100% to 1st
- TopTwo: 70%/30%
- TopThree: 50%/30%/20%
- TopFive: 40%/25%/18%/10%/7%
- EvenSplit: Equal among all
- Custom: Define CustomPrizePercentages`,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'stages', 'rooms', 'invite', 'private', 'phase 6'],
      },

      // ==========================================
      // UNITY SDK - TROUBLESHOOTING
      // ==========================================
      {
        title: 'Unity SDK Troubleshooting Guide',
        content: `COMMON SDK ISSUES AND SOLUTIONS:

ISSUE: SDK not initializing
SYMPTOMS: OnInitialized never fires, Deskillz.IsInitialized is false

SOLUTIONS:
1. Check API Key and Game ID are correct
2. Verify DeskillzConfig asset is properly configured
3. Check console for DeskillzError events
4. Ensure network connectivity
5. Try Sandbox environment first

\`\`\`csharp
DeskillzEvents.OnInitializationFailed += (error) => {
    Debug.LogError($"Init failed: {error.Code} - {error.Message}");
};
\`\`\`

---

ISSUE: Scores not submitting
SYMPTOMS: Score shows locally but not on server

SOLUTIONS:
1. Ensure match is active: MatchController.Instance.IsMatchActive
2. Check for validation errors in ScoreValidator
3. Verify network connection
4. Check anti-cheat isn't flagging legitimate scores

\`\`\`csharp
ScoreManager.Instance.OnSubmissionFailed += (error) => {
    Debug.LogError($"Submit failed: {error}");
};
\`\`\`

---

ISSUE: Multiplayer not connecting
SYMPTOMS: OnConnected never fires, players can't see each other

SOLUTIONS:
1. Check SyncManager.Instance.IsConnected
2. Verify WebSocket URL in config
3. Check firewall/network settings
4. Ensure both players have same room ID

\`\`\`csharp
SyncManager.Instance.OnDisconnected += (reason) => {
    Debug.LogError($"Disconnected: {reason}");
};
\`\`\`

---

ISSUE: UI not showing
SYMPTOMS: HUD, leaderboard, or results don't appear

SOLUTIONS:
1. Check DeskillzUIManager.Instance.UseBuiltInUI is true
2. Ensure Canvas exists and is properly configured
3. Check theme is applied
4. Verify _autoShowHUD and _autoShowResults settings

\`\`\`csharp
// Force show
DeskillzUIManager.Instance.ShowHUD();
\`\`\`

---

ISSUE: Lag compensation not working
SYMPTOMS: Hits registering incorrectly, players teleporting

SOLUTIONS:
1. Increase interpolation delay
2. Check sync rate (20 Hz default)
3. Verify NetworkTransform is on all synced objects
4. Use PerformLagCompensatedAction for hit detection

---

ISSUE: Stage invite code not working
SYMPTOMS: "Stage not found" when joining

SOLUTIONS:
1. Verify code is uppercase (auto-converted)
2. Check stage hasn't expired or been cancelled
3. Ensure stage visibility allows joining
4. Check if stage is full`,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'troubleshooting', 'issues', 'errors', 'debug'],
      },

      // ==========================================
      // UNITY SDK - BEST PRACTICES
      // ==========================================
      {
        title: 'Unity SDK Best Practices',
        content: `SDK BEST PRACTICES FOR DEVELOPERS:

PERFORMANCE:
1. Sync rate - Use 20 Hz for most games, 30+ for fast-paced
2. State size - Keep PlayerState minimal
3. Unreliable messages - Use for frequent updates (position)
4. Reliable messages - Use for important events (score, death)
5. Object pooling - Reuse network messages

SECURITY:
1. Never trust client - Validate all scores server-side
2. Use ProtectedScore - Prevents memory editing
3. Record inputs - Correlate scores with player actions
4. Rate limiting - Configure appropriate limits for your game
5. Don't expose keys - Keep API keys out of source control

USER EXPERIENCE:
1. Show connection status - Use NetworkStats for ping display
2. Handle disconnects gracefully - Auto-reconnect, notify user
3. Smooth interpolation - Tune interpolationSpeed per game
4. Responsive UI - Use _animateScoreChanges for polish
5. Clear feedback - Use notifications for important events

CODE ORGANIZATION:
1. Single responsibility - One script per feature
2. Event-driven - Use DeskillzEvents for decoupling
3. Singletons sparingly - Access via Instance properties
4. Clean up - Unsubscribe from events in OnDisable

QUICK REFERENCE:
\`\`\`csharp
// Initialization
Deskillz.Initialize(apiKey, gameId);

// Match flow
DeskillzEvents.OnMatchStart += (match) => StartGame();
DeskillzEvents.OnMatchComplete += (result) => ShowResults(result);

// During game
ScoreManager.Instance.AddScore(points);

// End game
MatchController.Instance.EndMatch();

// Multiplayer
SyncManager.Instance.SetLocalState(myState);
SyncManager.Instance.OnPlayerStateUpdated += (id, state) => {
    UpdateOpponent(id, state);
};

// Custom stages
StageManager.Instance.CreateStage(config, stage => {
    Debug.Log($"Code: {stage.InviteCode}");
});
StageManager.Instance.JoinByCode("ABC123");
StageManager.Instance.StartStage();
\`\`\``,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'best practices', 'performance', 'security', 'tips'],
      },

      // ==========================================
      // SDK FAQ
      // ==========================================
      {
        title: 'Unity SDK Frequently Asked Questions',
        content: `UNITY SDK FAQ:

GENERAL:
Q: What Unity versions are supported?
A: Unity 2020.3 LTS and newer.

Q: Can I use my own UI?
A: Yes, implement IDeskillzUI interface and call SetCustomUI().

Q: How do I test without real money?
A: Use DeskillzEnvironment.Sandbox in your config.

Q: What cryptocurrencies are supported?
A: BTC, ETH, SOLANA, XRP, BNB, USDT, USDC.

MATCHES:
Q: How do I end a match early?
A: Call MatchController.Instance.EndMatch() or ForfeitMatch().

Q: Can players pause?
A: Yes, MatchController.Instance.PauseMatch(). Configurable per game.

Q: How long can matches last?
A: Configurable via TimeLimitSeconds. 0 = no limit.

MULTIPLAYER:
Q: What's the max players per match?
A: Depends on game/server config. SDK supports up to 100.

Q: How do I handle player disconnects?
A: Listen to OnPlayerLeft event. SDK auto-handles reconnection attempts.

Q: Can I do peer-to-peer?
A: No, all communication goes through Deskillz servers for security.

STAGES:
Q: How long do invite codes last?
A: Until stage starts, is cancelled, or times out (default 30 min).

Q: Can spectators see scores?
A: Yes, if AllowSpectators is true in config.

Q: Can I change rules after creating?
A: Host can call UpdateConfig() before match starts.

SCORING:
Q: How does anti-cheat work?
A: Scores are encrypted, validated server-side, and compared against recorded inputs.

Q: What happens if a cheater is detected?
A: The AntiCheatViolation event fires, and the match may be invalidated.

Q: Can I use floating point scores?
A: Use integers only. Multiply by 100 for decimal precision (e.g., 15.75 → 1575).`,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['unity', 'sdk', 'faq', 'questions', 'answers'],
      },

      // ==========================================
      // DEVELOPER PORTAL
      // ==========================================
      {
        title: 'Developer Portal Guide',
        content: `DEVELOPER PORTAL OVERVIEW:

The Developer Portal at deskillz.games/developer allows game developers to:

1. REGISTER YOUR GAME
   - Create a new game listing
   - Set game name, description, icons
   - Configure game type (skill-based, timing, strategy, etc.)
   - Set supported platforms (iOS, Android)

2. GET API CREDENTIALS
   - API Key for SDK initialization
   - Game ID for your specific game
   - Webhook URLs for server notifications

3. CONFIGURE TOURNAMENTS
   - Set entry fee ranges
   - Configure prize distributions
   - Define tournament schedules
   - Set match durations

4. MANAGE REVENUE
   - View earnings dashboard
   - See player statistics
   - Track tournament performance
   - Configure payout settings

5. SDK DOWNLOADS
   - Download Unity SDK package
   - Download Unreal SDK package
   - Access documentation

6. ANALYTICS
   - Active players
   - Match completion rates
   - Revenue reports
   - Player retention metrics

GETTING STARTED:
1. Sign up at deskillz.games/developer
2. Create your first game
3. Download the SDK
4. Follow the integration guide
5. Submit for review
6. Launch!

REVENUE SHARING:
- Developers receive 70% of tournament entry fees
- Platform takes 30% for hosting, payments, anti-cheat
- Payouts are processed weekly
- Minimum payout threshold: $100`,
        category: AIKnowledgeCategory.DEVELOPER_SDK,
        tags: ['developer', 'portal', 'api', 'revenue', 'registration'],
      },

      // ==========================================
      // WALLET GUIDES
      // ==========================================
      {
        title: 'Connecting Your Wallet',
        content: `HOW TO CONNECT YOUR CRYPTOCURRENCY WALLET:

SUPPORTED WALLETS:
- MetaMask
- WalletConnect compatible wallets
- Coinbase Wallet
- Trust Wallet
- Rainbow

STEPS TO CONNECT:
1. Go to deskillz.games and click "Connect Wallet"
2. Select your wallet provider
3. Approve the connection request in your wallet
4. Your wallet is now linked to your Deskillz account

SUPPORTED CURRENCIES:
- ETH (Ethereum)
- BTC (Bitcoin)
- SOL (Solana)
- XRP (Ripple)
- BNB (Binance Coin)
- USDT (Tether)
- USDC (USD Coin)

IMPORTANT NOTES:
- You can connect multiple wallets
- Different currencies may use different networks
- Always verify you're on the correct network before transactions
- Keep your seed phrase safe - never share it with anyone

DEPOSITING FUNDS:
1. Go to your Wallet page
2. Click "Deposit"
3. Select the cryptocurrency
4. Copy the deposit address OR scan QR code
5. Send funds from your external wallet
6. Wait for blockchain confirmation (varies by currency)

WITHDRAWING FUNDS:
1. Go to your Wallet page
2. Click "Withdraw"
3. Enter the amount
4. Paste your destination wallet address
5. Confirm the transaction
6. Funds will arrive after blockchain confirmation`,
        category: AIKnowledgeCategory.WALLET,
        tags: ['wallet', 'connect', 'metamask', 'crypto', 'deposit', 'withdraw'],
      },

      // ==========================================
      // TOURNAMENTS
      // ==========================================
      {
        title: 'How Tournaments Work',
        content: `UNDERSTANDING DESKILLZ TOURNAMENTS:

TOURNAMENT TYPES:

1. HEAD-TO-HEAD
   - 1v1 matches
   - Direct competition
   - Winner takes the prize pool

2. BRACKET TOURNAMENTS
   - Multiple rounds
   - Elimination style
   - Bigger prize pools for winners

3. LEADERBOARD TOURNAMENTS
   - Play anytime during tournament window
   - Your best score competes
   - Multiple attempts allowed
   - Top scores win prizes

4. QUICK MATCHES
   - Instant matchmaking
   - Lower stakes
   - Great for practice

ENTRY FEES & PRIZES:
- Entry fee: What you pay to join
- Prize pool: Total of all entry fees (minus platform fee)
- Platform fee: 5-10% depending on tournament

EXAMPLE:
- 8 players pay $5 entry each
- Total pot: $40
- Platform fee (5%): $2
- Prize pool: $38
- 1st place: $22.80 (60%)
- 2nd place: $11.40 (30%)
- 3rd place: $3.80 (10%)

HOW TO JOIN A TOURNAMENT:
1. Open the game app (NOT the website)
2. Go to Tournaments section in the app
3. Select a tournament
4. Pay the entry fee
5. Play your match
6. Submit your score
7. Wait for results
8. Winnings go to your wallet automatically`,
        category: AIKnowledgeCategory.TOURNAMENT,
        tags: ['tournament', 'prizes', 'entry fee', 'how to', 'join'],
      },
    ];

    // Insert all knowledge entries
    for (const entry of knowledgeEntries) {
      try {
        const embedding = await this.generateEmbedding(entry.content);
        await this.prisma.aIKnowledgeBase.create({
          data: {
            title: entry.title,
            content: entry.content,
            category: entry.category,
            tags: entry.tags,
            embedding: embedding,
            isActive: true,
            timesUsed: 0,
            avgHelpfulness: 0,
          },
        });
        this.logger.log(`Seeded: ${entry.title}`);
      } catch (error) {
        this.logger.error(`Failed to seed: ${entry.title}`, error);
      }
    }

    this.logger.log('Knowledge base seeding complete!');
  }
}