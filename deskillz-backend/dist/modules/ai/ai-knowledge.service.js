"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AIKnowledgeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIKnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
let AIKnowledgeService = AIKnowledgeService_1 = class AIKnowledgeService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(AIKnowledgeService_1.name);
        this.openaiApiKey = this.configService.get('OPENAI_API_KEY');
    }
    async onModuleInit() {
        await this.seedKnowledgeBase();
    }
    async createKnowledge(dto) {
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
    async getAllKnowledge(category) {
        const where = { isActive: true };
        if (category) {
            where.category = category;
        }
        const knowledge = await this.prisma.aIKnowledgeBase.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return knowledge.map((k) => this.mapToResponseDto(k));
    }
    async updateKnowledge(id, dto) {
        const data = { ...dto };
        if (dto.content) {
            data.embedding = await this.generateEmbedding(dto.content);
        }
        const knowledge = await this.prisma.aIKnowledgeBase.update({
            where: { id },
            data,
        });
        return this.mapToResponseDto(knowledge);
    }
    async incrementUsage(ids) {
        if (ids.length === 0)
            return;
        await this.prisma.aIKnowledgeBase.updateMany({
            where: { id: { in: ids } },
            data: { timesUsed: { increment: 1 } },
        });
    }
    async searchKnowledge(query, limit = 5) {
        if (!this.openaiApiKey) {
            return this.textSearch(query, limit);
        }
        try {
            const queryEmbedding = await this.generateEmbedding(query);
            const knowledge = await this.prisma.aIKnowledgeBase.findMany({
                where: { isActive: true },
            });
            const withSimilarity = knowledge.map((k) => ({
                id: k.id,
                title: k.title,
                content: k.content,
                category: k.category,
                similarity: this.cosineSimilarity(queryEmbedding, k.embedding || []),
            }));
            return withSimilarity
                .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
                .slice(0, limit)
                .filter((k) => (k.similarity || 0) > 0.7);
        }
        catch (error) {
            this.logger.error('Semantic search failed, falling back to text search', error);
            return this.textSearch(query, limit);
        }
    }
    async textSearch(query, limit) {
        const results = await this.prisma.aIKnowledgeBase.findMany({
            where: {
                isActive: true,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { tags: { hasSome: query.toLowerCase().split(' ') } },
                ],
            },
            take: limit,
        });
        return results.map((r) => ({
            id: r.id,
            title: r.title,
            content: r.content,
            category: r.category,
        }));
    }
    async generateEmbedding(text) {
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
                    input: text,
                }),
            });
            const data = await response.json();
            return data.data[0].embedding;
        }
        catch (error) {
            this.logger.error('Failed to generate embedding', error);
            return [];
        }
    }
    cosineSimilarity(a, b) {
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
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    mapToResponseDto(knowledge) {
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
    async seedKnowledgeBase() {
        const existingCount = await this.prisma.aIKnowledgeBase.count();
        if (existingCount > 0) {
            this.logger.log('Knowledge base already seeded');
            return;
        }
        this.logger.log('Seeding knowledge base...');
        const knowledgeEntries = [
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
                category: 'GENERAL',
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

2. MOBILE GAME APPS (Android/iOS) - Where You Play
   - Open any Deskillz-integrated game on your phone
   - Browse available tournaments within the game
   - Join tournaments and pay entry fees
   - Play the actual game
   - Submit your score
   - Win cryptocurrency prizes

KEY POINT: You CANNOT play tournaments on the website. You must download the game app.

Flow: Website -> Download App -> Open App -> Join Tournament -> Play -> Win -> Withdraw to Wallet`,
                category: 'GENERAL',
                tags: ['website', 'game app', 'difference', 'how to play'],
            },
            {
                title: 'Unity SDK Overview',
                content: `The Deskillz Unity SDK enables game developers to integrate their Unity games into the Deskillz competitive gaming platform.

SDK FEATURES:
- Tournament Integration: Entry fees, prize pools, matchmaking
- Cryptocurrency Payments: BTC, ETH, SOL, XRP, BNB, USDT, USDC
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

Total SDK: ~30,600 lines of production-ready C# code across 32 files.`,
                category: 'DEVELOPER_SDK',
                tags: ['unity', 'sdk', 'overview', 'features', 'structure'],
            },
            {
                title: 'Unity SDK Installation Guide',
                content: `HOW TO INSTALL THE DESKILLZ UNITY SDK:

STEP 1: Import Package
1. Download deskillz-unity-sdk.zip from the Developer Portal
2. Extract to your Unity project's root folder
3. In Unity: Window -> Package Manager -> + -> Add package from disk
4. Select deskillz-unity-sdk/package.json

STEP 2: Create Configuration
1. Right-click in Project -> Create -> Deskillz -> Config
2. Set your API Key and Game ID (from developer portal)
3. Choose Environment (Sandbox for testing, Production for live)

STEP 3: Add to Scene
1. Create empty GameObject named "DeskillzManager"
2. Add DeskillzManager component
3. Assign your DeskillzConfig asset

STEP 4: Initialize
In your game's startup script:
void Start() {
    Deskillz.Initialize();
    Deskillz.OnInitialized += OnDeskillzReady;
}

STEP 5: Test
- Run in Unity Editor
- Use Sandbox environment (free test currency)
- Check Console for "Deskillz initialized successfully"

QUICK CHECK:
if (Deskillz.IsInitialized) {
    Debug.Log("Ready to go!");
}`,
                category: 'DEVELOPER_SDK',
                tags: ['unity', 'sdk', 'installation', 'setup', 'install', 'getting started'],
            },
            {
                title: 'Unity SDK Integration Workflow',
                content: `COMPLETE INTEGRATION WORKFLOW:

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
                category: 'DEVELOPER_SDK',
                tags: ['unity', 'sdk', 'integration', 'workflow', 'events', 'flow'],
            },
            {
                title: 'Unity SDK Core System',
                content: `CORE SYSTEM COMPONENTS:

DESKILLZ STATIC API:
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

DESKILLZ EVENTS:
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
DeskillzEvents.OnError`,
                category: 'DEVELOPER_SDK',
                tags: ['unity', 'sdk', 'core', 'initialization', 'events', 'config'],
            },
            {
                title: 'Unreal Engine SDK Overview',
                content: `The Deskillz Unreal Engine SDK enables game developers to integrate their Unreal Engine games into the Deskillz competitive gaming platform.

SDK FEATURES:
- Tournament Integration: Entry fees, prize pools, matchmaking
- Cryptocurrency Payments: BTC, ETH, SOL, XRP, BNB, USDT, USDC
- Real-time Multiplayer: WebSocket-based synchronous gameplay
- Asynchronous Gameplay: Score-attack, turn-based modes
- Anti-Cheat: AES-256-GCM encryption, HMAC signatures, memory protection
- Pre-Built UI: UMG widgets for tournaments, wallet, results
- Analytics: Event tracking, telemetry, A/B testing
- Platform Integration: Deep links, push notifications, app lifecycle

SUPPORTED PLATFORMS:
- Unreal Engine 4.27+ and 5.x
- iOS 12+
- Android API 21+
- Windows, Mac (for development)

SDK STRUCTURE:
deskillz-unreal-sdk/
├── Source/
│   └── Deskillz/
│       ├── Public/         (Headers)
│       │   ├── Core/       (SDK, Config, Events, Types)
│       │   ├── Match/      (Matchmaking, MatchManager)
│       │   ├── Security/   (Encryption, AntiCheat, SecureSubmitter)
│       │   ├── Network/    (HTTP, WebSocket, API)
│       │   ├── Analytics/  (Events, Telemetry, Tracker)
│       │   ├── Platform/   (Device, DeepLinks, Notifications)
│       │   ├── UI/         (UMG Widgets)
│       │   └── Blueprints/ (Blueprint Library)
│       ├── Private/        (Implementations)
│       └── Tests/          (Unit & Integration Tests)
├── Content/
│   ├── Blueprints/         (Blueprint assets)
│   └── Widgets/            (Widget Blueprints)
└── Docs/                   (Documentation)

Total SDK: ~33,000 lines of production-ready C++ code across 77 files.`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'overview', 'features', 'structure', 'ue4', 'ue5'],
            },
            {
                title: 'Unreal Engine SDK Installation Guide',
                content: `HOW TO INSTALL THE DESKILLZ UNREAL SDK:

STEP 1: Copy Plugin to Project
1. Download deskillz-unreal-sdk from the Developer Portal
2. Copy to your project's Plugins folder:
   YourProject/
   └── Plugins/
       └── Deskillz/
           ├── Deskillz.uplugin
           └── Source/

3. Right-click your .uproject file and "Generate Visual Studio project files"

STEP 2: Enable Plugin
In your .uproject file, add:
{
  "Plugins": [
    {
      "Name": "Deskillz",
      "Enabled": true
    }
  ]
}

STEP 3: Add Module Dependency
In your game's Build.cs file:
PublicDependencyModuleNames.AddRange(new string[] {
    "Deskillz"
});

STEP 4: Include Headers
#include "Core/DeskillzSDK.h"
#include "Match/DeskillzMatchmaking.h"
#include "Security/DeskillzSecureSubmitter.h"

STEP 5: Initialize SDK
In your GameMode or GameInstance:

void AYourGameMode::BeginPlay()
{
    Super::BeginPlay();
    
    FDeskillzConfig Config;
    Config.GameId = TEXT("your_game_id");
    Config.ApiKey = TEXT("your_api_key");
    Config.Environment = EDeskillzEnvironment::Sandbox;
    
    UDeskillzSDK::Get()->Initialize(Config);
}

STEP 6: Test in Sandbox
- Use Sandbox environment during development
- Test cryptocurrency is provided (no real money)
- Switch to Production only when ready to launch

QUICK CHECK:
if (UDeskillzSDK::Get()->IsInitialized())
{
    UE_LOG(LogTemp, Log, TEXT("Deskillz SDK Ready!"));
}`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'installation', 'setup', 'install', 'getting started'],
            },
            {
                title: 'Unreal SDK Core Classes',
                content: `CORE SDK CLASSES:

UDeskillzSDK (Singleton)
- Get() - Get singleton instance
- Initialize(Config) - Initialize with config
- Shutdown() - Clean shutdown
- IsInitialized() - Check if ready
- GetGameId() - Get game ID
- GetSDKVersion() - Version string

FDeskillzConfig (Struct)
- GameId (FString) - Your game's ID
- ApiKey (FString) - API key from portal
- Environment (Enum) - Sandbox or Production
- BaseUrl (FString) - Auto-configured
- ApiTimeout (float) - Request timeout
- bEnableLogging (bool) - Debug logging
- bEnableAnalytics (bool) - Event tracking
- bEnableAntiCheat (bool) - Anti-cheat system

UDeskillzEvents (Event Dispatcher)
Delegates:
- OnSDKInitialized(bool bSuccess)
- OnSDKError(FString Code, FString Message)
- OnAuthStateChanged(bool bAuthenticated)
- OnConnectionStateChanged(State)
- OnWalletUpdated(Balance)

USAGE EXAMPLE:
// Bind events before initializing
UDeskillzEvents* Events = UDeskillzEvents::Get();
Events->OnSDKInitialized.AddDynamic(this, &AMyClass::OnSDKReady);
Events->OnSDKError.AddDynamic(this, &AMyClass::OnSDKError);

// Initialize
FDeskillzConfig Config;
Config.GameId = TEXT("my_game");
Config.ApiKey = TEXT("api_key_123");
Config.Environment = EDeskillzEnvironment::Sandbox;
Config.bEnableAntiCheat = true;

UDeskillzSDK::Get()->Initialize(Config);`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'core', 'initialization', 'config', 'events'],
            },
            {
                title: 'Unreal SDK Matchmaking and Tournaments',
                content: `MATCHMAKING CLASSES:

UDeskillzMatchmaking (Singleton)
Methods:
- StartMatchmaking(TournamentId) - Begin finding match
- StartMatchmakingWithConfig(Config) - With custom options
- CancelMatchmaking() - Stop searching
- IsMatchmaking() - Check status
- GetMatchmakingDuration() - Time spent searching

Delegates:
- OnMatchFound(FDeskillzMatch Match)
- OnMatchmakingFailed(FString Reason)
- OnMatchmakingCancelled()
- OnMatchmakingProgress(float, int32)

UDeskillzMatchManager (Singleton)
Methods:
- StartMatch(MatchId) - Begin match
- EndMatch(Result) - Complete match
- PauseMatch() - Pause gameplay
- ResumeMatch() - Resume gameplay
- AbortMatch(Reason) - Cancel abnormally
- GetCurrentMatch() - Current match info
- IsMatchActive() - Check if in match
- GetMatchDuration() - Elapsed time

WORKFLOW:
1. Player selects tournament
2. StartMatchmaking(TournamentId)
3. Wait for OnMatchFound callback
4. StartMatch(Match.MatchId)
5. Run your gameplay
6. SubmitScore when complete
7. EndMatch with result

EXAMPLE CODE:
void AMyGameMode::EnterTournament(const FString& TournamentId)
{
    UDeskillzMatchmaking* MM = UDeskillzMatchmaking::Get();
    MM->OnMatchFound.AddDynamic(this, &AMyGameMode::OnMatchFound);
    MM->OnMatchmakingFailed.AddDynamic(this, &AMyGameMode::OnMatchFailed);
    MM->StartMatchmaking(TournamentId);
}

void AMyGameMode::OnMatchFound(const FDeskillzMatch& Match)
{
    CurrentMatchId = Match.MatchId;
    UDeskillzMatchManager::Get()->StartMatch(Match.MatchId);
    StartYourGameplay();
}`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'matchmaking', 'tournament', 'match', 'competition'],
            },
            {
                title: 'Unreal SDK Score Submission and Security',
                content: `SECURE SCORE SUBMISSION:

UDeskillzSecureSubmitter (Singleton)
Methods:
- SubmitScore(Score, PlayDuration) - Submit encrypted score
- SubmitScoreWithMetadata(Score, Duration, Metadata) - With extra data
- IsSubmitting() - Check if in progress
- GetLastSubmissionId() - Last submission ID

Delegates:
- OnScoreSubmitted(bool bSuccess, FString Message)
- OnScoreValidated(bool bValid, int32 Rank)
- OnSubmissionProgress(float Progress)

SECURITY FEATURES:

UDeskillzScoreEncryption
- AES-256-GCM encryption
- Context-sensitive (matchId + userId)
- HMAC-SHA256 signatures
- Tamper detection

UDeskillzAntiCheat
- Speed hack detection
- Memory integrity checks
- Replay attack prevention
- Frame time validation

EXAMPLE:
void AMyGameMode::OnGameplayComplete()
{
    float Duration = GetWorld()->GetTimeSeconds() - MatchStartTime;
    
    UDeskillzSecureSubmitter* Submitter = UDeskillzSecureSubmitter::Get();
    Submitter->OnScoreSubmitted.AddDynamic(this, &AMyGameMode::OnScoreSubmitted);
    
    // SDK handles encryption automatically
    Submitter->SubmitScore(FinalScore, Duration);
}

void AMyGameMode::OnScoreSubmitted(bool bSuccess, const FString& Message)
{
    if (bSuccess)
    {
        UDeskillzMatchManager::Get()->EndMatch(EDeskillzMatchResult::Completed);
        UDeskillzUIManager::Get()->ShowResults();
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("Score submission failed: %s"), *Message);
    }
}

IMPORTANT:
- Always use SubmitScore, never send raw scores
- SDK validates score/time ratio automatically
- Anti-cheat runs during gameplay
- Suspicious activity is flagged server-side`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'score', 'security', 'encryption', 'anti-cheat', 'submit'],
            },
            {
                title: 'Unreal SDK Networking and Real-time',
                content: `NETWORKING CLASSES:

UDeskillzHttpClient (REST API)
Methods:
- Get(Endpoint, Callback)
- Post(Endpoint, Body, Callback)
- Put(Endpoint, Body, Callback)
- Delete(Endpoint, Callback)
- SetAuthToken(Token)
- SetTimeout(Seconds)
- CancelAllRequests()

UDeskillzWebSocket (Real-time)
Methods:
- Connect(Url) - Connect to server
- Disconnect() - Disconnect
- IsConnected() - Check status
- JoinRoom(RoomId) - Join match room
- LeaveRoom(RoomId) - Leave room
- SendMessage(Event, Data) - Send event
- SendGameState(State) - Send game state

Delegates:
- OnConnected()
- OnDisconnected(Reason)
- OnMessageReceived(Event, Data)
- OnError(Error)
- OnRoomJoined(RoomId)
- OnRoomLeft(RoomId)

UDeskillzApiService (High-level API)
Methods:
- Login(Username, Password, Callback)
- Register(Username, Email, Password, Callback)
- Logout()
- GetTournaments(Callback)
- EnterTournament(TournamentId, Callback)
- GetWalletBalance(Callback)
- GetLeaderboard(TournamentId, Page, Callback)

SYNCHRONOUS MULTIPLAYER EXAMPLE:
void AMyGameMode::OnMatchFound(const FDeskillzMatch& Match)
{
    // Connect to real-time server
    UDeskillzWebSocket* WS = UDeskillzWebSocket::Get();
    WS->OnConnected.AddDynamic(this, &AMyGameMode::OnConnected);
    WS->OnMessageReceived.AddDynamic(this, &AMyGameMode::OnMessage);
    WS->Connect(WebSocketUrl);
}

void AMyGameMode::OnConnected()
{
    WS->JoinRoom(CurrentMatchId);
}

void AMyGameMode::Tick(float DeltaTime)
{
    // Send state updates (20 Hz recommended)
    TSharedPtr<FJsonObject> State = MakeShareable(new FJsonObject());
    State->SetNumberField(TEXT("x"), PlayerPosition.X);
    State->SetNumberField(TEXT("score"), CurrentScore);
    WS->SendGameState(State);
}`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'network', 'http', 'websocket', 'realtime', 'multiplayer'],
            },
            {
                title: 'Unreal SDK UI Widgets',
                content: `PRE-BUILT UMG WIDGETS:

UDeskillzUIManager (Widget Manager)
Methods:
- ShowTournamentList() - Tournament browser
- HideTournamentList()
- ShowMatchmaking() - Matchmaking UI
- HideMatchmaking()
- ShowResults() - Match results
- HideResults()
- ShowWallet() - Wallet display
- HideWallet()
- ShowLeaderboard(TournamentId)
- HideLeaderboard()
- ShowPopup(Title, Message) - Modal dialog
- ShowLoading(Message) - Loading indicator
- HideLoading()
- SetTheme(Theme) - Apply custom theme

AVAILABLE WIDGETS:
1. UDeskillzTournamentListWidget - Browse tournaments, filter, one-click entry
2. UDeskillzMatchmakingWidget - Searching animation, cancel button
3. UDeskillzResultsWidget - Win/loss display, score comparison, prizes
4. UDeskillzWalletWidget - Multi-currency balances, transaction history
5. UDeskillzLeaderboardWidget - Player rankings, score display
6. UDeskillzHUDWidget - In-game overlay, score, timer
7. UDeskillzPopupWidget - Modal dialogs, confirmation prompts
8. UDeskillzLoadingWidget - Loading spinner, progress message

THEMING:
FDeskillzUITheme Theme;
Theme.PrimaryColor = FLinearColor(0.2f, 0.6f, 1.0f, 1.0f);   // Blue
Theme.SecondaryColor = FLinearColor(0.1f, 0.1f, 0.15f, 1.0f); // Dark
Theme.AccentColor = FLinearColor(1.0f, 0.8f, 0.0f, 1.0f);     // Gold
Theme.TextColor = FLinearColor::White;
Theme.CornerRadius = 8.0f;
Theme.Padding = 16.0f;

UDeskillzUIManager::Get()->SetTheme(Theme);

CUSTOM WIDGETS:
Create Widget Blueprints that extend C++ base classes:
- Content/Widgets/WBP_TournamentList.uasset -> UDeskillzTournamentListWidget
- Content/Widgets/WBP_Matchmaking.uasset -> UDeskillzMatchmakingWidget
- Content/Widgets/WBP_Results.uasset -> UDeskillzResultsWidget`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'ui', 'widget', 'umg', 'interface', 'screen'],
            },
            {
                title: 'Unreal SDK Analytics and Telemetry',
                content: `ANALYTICS CLASSES:

UDeskillzAnalytics (Event Tracking)
Methods:
- TrackEvent(Name, Category) - Simple event
- TrackEvent(Name, Category, Params) - With parameters
- TrackScreenView(ScreenName) - Screen views
- TrackButtonClick(ButtonId, Screen) - Button clicks
- TrackSessionStart() - Session begin
- TrackSessionEnd() - Session end
- SetUserProperty(Key, Value) - User properties
- Flush() - Force send events
- GetQueuedEventCount() - Pending events

UDeskillzTelemetry (Performance)
Methods:
- StartMonitoring() - Begin monitoring
- StopMonitoring() - Stop monitoring
- RecordMetric(Type, Name, Value) - Custom metric
- RecordLatency(Milliseconds) - Network latency
- GetCurrentFPS() - Current framerate
- GetAverageFPS() - Average framerate
- GetMemoryUsage() - Memory in bytes

UDeskillzEventTracker (Specialized)
Methods:
- StartTimedEvent(Name) - Start timer
- EndTimedEvent(Name) - End and record
- TrackEntryFee(TournamentId, Currency, Amount)
- TrackPrizeWon(TournamentId, Currency, Amount)
- IncrementCounter(Name, Amount)
- SetABTestVariant(Test, Variant)
- TrackConversion(Funnel, Step)

EXAMPLE:
// Track level complete
TMap<FString, FString> Params;
Params.Add(TEXT("level"), TEXT("5"));
Params.Add(TEXT("score"), FString::FromInt(Score));
UDeskillzAnalytics::Get()->TrackEvent(TEXT("level_complete"), 
    EDeskillzEventCategory::Gameplay, Params);

// Track timed event
UDeskillzEventTracker* Tracker = UDeskillzEventTracker::Get();
Tracker->StartTimedEvent(TEXT("boss_fight"));
// ... gameplay ...
Tracker->EndTimedEvent(TEXT("boss_fight"));`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'analytics', 'telemetry', 'events', 'tracking', 'metrics'],
            },
            {
                title: 'Unreal SDK Platform Integration',
                content: `PLATFORM CLASSES:

UDeskillzPlatform (Device Detection)
Methods:
- Initialize() - Detect platform
- IsMobile() - Mobile platform?
- IsDesktop() - Desktop platform?
- IsIOS() - iOS?
- IsAndroid() - Android?
- GetDeviceInfo() - Full device info
- GetNetworkInfo() - Network status
- GetDeviceTier() - Performance tier

UDeskillzDeepLink (URL Handling)
Methods:
- SetURLScheme(Scheme) - Set app scheme
- HandleDeepLink(URL) - Process link
- GenerateTournamentLink(TournamentId)
- GenerateReferralLink(ReferralCode)
- HasPendingDeepLink() - Check pending
- GetPendingDeepLink() - Get and clear

Delegates:
- OnDeepLinkReceived(Data)

UDeskillzPushNotifications
Methods:
- RequestPermission(Callback) - Ask for permission
- GetPermissionStatus() - Current status
- ScheduleLocalNotification(Notification)
- CancelNotification(Id)
- SubscribeToTopic(Topic)
- UnsubscribeFromTopic(Topic)

UDeskillzAppLifecycle
Methods:
- Initialize() - Start tracking
- IsInBackground() - App backgrounded?
- GetBackgroundDuration() - Time in background
- GetSessionDuration() - Session length

Delegates:
- OnEnterBackground()
- OnEnterForeground()
- OnSessionTimeout()

DEEP LINK EXAMPLE:
// Setup
UDeskillzDeepLink* DeepLink = UDeskillzDeepLink::Get();
DeepLink->SetURLScheme(TEXT("deskillz-mygame"));
DeepLink->OnDeepLinkReceived.AddDynamic(this, &AMyClass::OnDeepLink);

// Generate shareable link
FString Link = DeepLink->GenerateTournamentLink(TEXT("tournament_123"));
// Result: deskillz-mygame://tournament/tournament_123`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'platform', 'deeplink', 'notification', 'push', 'lifecycle'],
            },
            {
                title: 'Unreal SDK Blueprint Support',
                content: `BLUEPRINT INTEGRATION:

UDeskillzBlueprintLibrary provides Blueprint nodes for all SDK functions.

AVAILABLE BLUEPRINT NODES:

Initialization:
- Initialize Deskillz (GameId, ApiKey, Environment)
- Is Deskillz Initialized
- Shutdown Deskillz

Tournaments:
- Get Tournaments (async)
- Enter Tournament
- Leave Tournament

Matchmaking:
- Start Matchmaking
- Cancel Matchmaking
- Is Matchmaking
- Get Matchmaking Duration

Match:
- Start Match
- End Match
- Pause Match
- Resume Match
- Get Match Duration
- Is Match Active

Score:
- Submit Score
- Add Score
- Get Current Score

Wallet:
- Get Wallet Balance
- Get All Balances

UI:
- Show Tournament List
- Show Matchmaking
- Show Results
- Show Wallet
- Show Popup
- Show Loading
- Hide Loading

Analytics:
- Track Event
- Track Screen View
- Start Timed Event
- End Timed Event

ADeskillzManager (Blueprint Actor):
Drag into level for easy setup:
- Exposes GameId, ApiKey, Environment in Details panel
- Auto-initializes on BeginPlay
- Provides event dispatchers for all SDK events

EXAMPLE BLUEPRINT FLOW:
Event BeginPlay
    |
Initialize Deskillz (GameId, ApiKey, Sandbox)
    |
Bind to OnSDKInitialized
    |
On Initialized -> Show Tournament List
    |
User selects tournament
    |
Start Matchmaking (TournamentId)
    |
On Match Found -> Start Match
    |
Your Gameplay Logic
    |
Submit Score (FinalScore, Duration)
    |
On Score Submitted -> Show Results`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'blueprint', 'visual', 'scripting', 'nodes'],
            },
            {
                title: 'Unreal SDK Complete Integration Workflow',
                content: `COMPLETE INTEGRATION WORKFLOW:

1. SETUP (One-time)
   - Download SDK from Developer Portal
   - Copy to Plugins/ folder
   - Add to Build.cs dependencies
   - Enable in .uproject
   - Create configuration (GameId, ApiKey)

2. INITIALIZATION (On Game Start)
   BeginPlay:
     -> Initialize SDK with config
     -> Bind to OnSDKInitialized
     -> Show main menu when ready

3. TOURNAMENT FLOW
   Main Menu:
     -> Call GetTournaments()
     -> Display tournament list
     -> Player selects tournament
     -> Call EnterTournament()
     -> Show entry fee confirmation
   
   Entry Confirmed:
     -> Wallet deducts entry fee
     -> Call StartMatchmaking()
     -> Show matchmaking UI
     -> Wait for OnMatchFound

4. MATCH FLOW
   Match Found:
     -> Call StartMatch(MatchId)
     -> Hide matchmaking UI
     -> Load game level
     -> Start countdown (optional)
     -> Begin gameplay
   
   During Gameplay:
     -> Track score (AddScore)
     -> Anti-cheat runs automatically
     -> Analytics track events
   
   Game Complete:
     -> Call SubmitScore(Score, Duration)
     -> Wait for OnScoreSubmitted
     -> Call EndMatch(Result)
     -> Show results UI

5. RESULTS
   Show Results:
     -> Display win/loss
     -> Show prize amount
     -> Update leaderboard
     -> Options: Play Again, Return to Menu

6. POST-MATCH
   Player can:
     -> Enter another tournament
     -> Check wallet balance
     -> View transaction history
     -> Withdraw winnings

SYNCHRONOUS VS ASYNCHRONOUS:

ASYNCHRONOUS (Score Attack):
- Players compete independently
- Submit best score
- Compare when both complete
- Good for: puzzle, endless runner

SYNCHRONOUS (Real-time):
- Players connected via WebSocket
- Send/receive game state
- See opponent in real-time
- Good for: racing, fighting`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'workflow', 'integration', 'flow', 'guide', 'complete'],
            },
            {
                title: 'Unreal SDK Troubleshooting',
                content: `COMMON ISSUES AND SOLUTIONS:

SDK NOT INITIALIZING:
- Verify GameId and ApiKey are correct (from Developer Portal)
- Check network connectivity
- Ensure correct Environment (Sandbox for testing)
- Enable logging: Config.bEnableLogging = true
- Check Output Log for error messages

MATCHMAKING NOT WORKING:
- Verify tournament exists and is active
- Check player has sufficient wallet balance
- Ensure SDK is fully initialized first
- Check OnMatchmakingFailed for error reason

SCORE NOT SUBMITTING:
- Verify match is active (IsMatchActive())
- Check score is valid (positive, not ridiculous)
- Ensure stable internet connection
- Check OnScoreSubmitted callback for errors

WEBSOCKET DISCONNECTING:
- Check network stability
- Implement reconnection logic
- Verify server URL is correct
- Handle OnDisconnected event

UI NOT DISPLAYING:
- Ensure widgets are added to viewport
- Check Z-order for overlapping widgets
- Verify UMG is properly initialized
- Check for null widget references

ENCRYPTION ERRORS:
- Let SDK handle encryption automatically
- Don't modify encrypted payloads
- Ensure MatchId and UserId are correct

BLUEPRINT NODES MISSING:
- Restart Unreal Editor after enabling plugin
- Verify Deskillz module is in Build.cs
- Check plugin is enabled in .uproject

DEBUG LOGGING:
FDeskillzConfig Config;
Config.bEnableLogging = true;
Config.LogLevel = EDeskillzLogLevel::Verbose;

// Check logs in:
// Window -> Developer Tools -> Output Log
// Filter by "Deskillz"

TESTING:
- Use Sandbox environment for all testing
- Test cryptocurrency is free and unlimited
- Run unit tests: Automation -> Deskillz.*
- Use Mock Server for isolated testing

CONTACT SUPPORT:
- Email: sdk-support@deskillz.games
- Include: Platform, UE version, error logs
- Provide reproduction steps`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'troubleshooting', 'error', 'problem', 'fix', 'debug'],
            },
            {
                title: 'Unreal SDK Folder Structure Explained',
                content: `UNREAL SDK FOLDER STRUCTURE:

deskillz-unreal-sdk/
├── Deskillz.uplugin          # Plugin descriptor (REQUIRED)
├── README.md                 # Main documentation
│
├── Content/                  # Unreal assets (created in Editor)
│   ├── Blueprints/           # Blueprint assets (.uasset)
│   │   └── README.md         # Instructions for creating Blueprints
│   └── Widgets/              # Widget Blueprint assets (.uasset)
│       └── README.md         # Instructions for creating UMG widgets
│
├── Resources/                # Plugin resources
│   ├── README.md             # Instructions for icons
│   └── Icon128.png           # Plugin icon (128x128)
│
├── Docs/                     # Documentation
│   ├── QUICKSTART.md         # 15-minute integration guide
│   ├── API_REFERENCE.md      # Complete API documentation
│   └── INTEGRATION_GUIDE.md  # Detailed integration patterns
│
└── Source/
    ├── Deskillz/             # Main runtime module
    │   ├── Public/           # Header files (.h)
    │   │   ├── Core/         # SDK, Config, Events, Types
    │   │   ├── Match/        # Matchmaking, MatchManager
    │   │   ├── Security/     # Encryption, AntiCheat
    │   │   ├── Network/      # HTTP, WebSocket, API
    │   │   ├── Analytics/    # Events, Telemetry
    │   │   ├── Platform/     # Device, DeepLinks
    │   │   ├── UI/           # UMG Widget classes
    │   │   └── Blueprints/   # Blueprint function library
    │   ├── Private/          # Implementation files (.cpp)
    │   └── Tests/            # Unit & integration tests
    │
    └── DeskillzEditor/       # Editor-only module
        ├── Public/           # Editor tools headers
        └── Private/          # Editor tools implementation

KEY FOLDERS:

Content/Blueprints/ - Create Blueprint actors here
- BP_DeskillzManager.uasset (drag into level)
- Example tournament flow Blueprints

Content/Widgets/ - Create Widget Blueprints here
- WBP_TournamentList.uasset
- WBP_Matchmaking.uasset
- WBP_Results.uasset
- WBP_Wallet.uasset

Resources/ - Plugin resources
- Icon128.png (plugin icon for Editor)

Source/Deskillz/Tests/ - Testing
- Unit tests for all modules
- Integration tests
- Mock server for isolated testing`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'folder', 'structure', 'organization', 'files'],
            },
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
                category: 'WALLET',
                tags: ['wallet', 'connect', 'metamask', 'crypto', 'deposit', 'withdraw'],
            },
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

4. JACKPOT TOURNAMENTS
   - Entry fees pool together
   - Winner takes all (or large portion)
   - Higher risk, higher reward

JOINING A TOURNAMENT:
1. Open the game app on your mobile device
2. Go to Tournaments/Compete section
3. Browse available tournaments
4. Check entry fee and prize pool
5. Click "Enter" and confirm payment
6. Wait for matchmaking or play immediately

ENTRY FEES:
- Paid in cryptocurrency (ETH, BTC, SOL, etc.)
- Deducted from your in-game wallet
- Entry fee determines prize pool size

PRIZES:
- Distributed based on final ranking
- Automatically credited to your wallet
- Can be withdrawn anytime

FAIR PLAY:
- All scores are encrypted and validated
- Anti-cheat systems monitor gameplay
- Cheaters are banned and forfeit winnings`,
                category: 'TOURNAMENT',
                tags: ['tournament', 'competition', 'how to', 'join', 'prizes'],
            },
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
3. Download the SDK (Unity or Unreal)
4. Follow the integration guide
5. Submit for review
6. Launch!

REVENUE SHARING:
- Developers receive 70% of platform service fees
- Platform takes 30% for hosting, payments, anti-cheat
- Payouts are processed monthly
- Minimum payout threshold: 100 USDT`,
                category: 'DEVELOPER_SDK',
                tags: ['developer', 'portal', 'api', 'revenue', 'registration'],
            },
            {
                title: 'Wallet Connection Issues',
                content: `Troubleshooting wallet connection problems:

Common Issues and Solutions:

1. Wallet Not Connecting
- Make sure your wallet extension is installed and unlocked
- Try refreshing the page
- Clear browser cache and cookies
- Disable other wallet extensions temporarily
- Try a different browser (Chrome recommended)

2. Wrong Network
- Switch to a supported network in your wallet
- Supported: Ethereum, Polygon, BSC, Arbitrum, Optimism, Base
- Add the network manually if needed

3. Transaction Failing
- Check you have enough native token for gas fees
- Increase gas limit if needed
- Wait and retry if network is congested

4. Wallet Not Showing Balance
- Refresh the page
- Check you're on the correct network
- Verify the token is added to your wallet

5. Mobile Wallet Issues (Game App)
- Ensure the game has permission to connect
- Try reconnecting your wallet in game settings
- Check your internet connection

Still Having Issues?
- Try disconnecting and reconnecting your wallet
- Restart your browser/app
- Contact support through the Help section`,
                category: 'TROUBLESHOOTING',
                tags: ['wallet', 'connection', 'error', 'problem', 'fix'],
            },
            {
                title: 'Tournament Issues',
                content: `Troubleshooting tournament problems:

"Can't Find Tournaments"
- Tournaments are in the GAME APP, not the website
- Open the game on your mobile device
- Look for Tournaments/Compete section in the game menu

"Can't Join Tournament"
- Check you have sufficient balance for entry fee
- Verify your wallet is connected in the game
- Tournament may be full - try another one
- Check if tournament has already started

"Score Not Submitting"
- Ensure stable internet connection during gameplay
- The SDK submits scores automatically
- Check for game updates if issue persists
- Contact support with match details

"Didn't Receive Prize"
- Prizes are distributed after tournament ends
- Check your transaction history
- Verify connected wallet address
- Allow up to 24 hours for processing

"Tournament Cancelled"
- Entry fees are automatically refunded
- Refunds typically process within 1 hour
- Check your transaction history

"Disconnected During Match"
- Try to reconnect quickly
- If match lost, contact support
- Provide tournament ID and timestamp`,
                category: 'TROUBLESHOOTING',
                tags: ['tournament', 'error', 'problem', 'fix', 'help'],
            },
            {
                title: 'Frequently Asked Questions - General',
                content: `General FAQs about Deskillz:

Q: Is Deskillz free to use?
A: Creating an account is free. Tournament entry fees vary by tournament. Some games offer free practice modes.

Q: What countries is Deskillz available in?
A: Deskillz is available globally, but some regions may have restrictions on real-money gaming. Check local regulations.

Q: Is Deskillz safe and secure?
A: Yes! We use blockchain technology for transparent transactions, secure wallet connections, and encrypted communications.

Q: How do I contact support?
A: Use the AI assistant (that's me!), email support@deskillz.games, or visit the Help section on the website.

Q: Can I play on desktop/web browser?
A: No, games are mobile apps only (Android/iOS). The website is for information, downloads, and account management.

Q: What's the minimum age to play?
A: You must be 18 years or older to participate in real-money tournaments.

Q: How do I report a bug or cheater?
A: Use the Report function in the game or contact support with details.`,
                category: 'FAQ',
                tags: ['faq', 'questions', 'general', 'help', 'info'],
            },
            {
                title: 'Account Security Best Practices',
                content: `Keep your Deskillz account secure:

DO:
- Use a strong, unique password
- Enable two-factor authentication (2FA)
- Use a hardware wallet for large balances
- Verify URLs before connecting your wallet
- Keep your device's software updated
- Log out from shared devices

DON'T:
- Never share your wallet seed phrase
- Never share your private keys
- Never click suspicious links
- Never give anyone remote access to your device
- Never send crypto to "double your money" offers

We Will NEVER:
- Ask for your seed phrase
- Ask for your private keys
- Send DMs asking for wallet access
- Request you to send crypto to verify your account

If You Suspect Unauthorized Access:
1. Change your password immediately
2. Disconnect and reconnect your wallet
3. Check transaction history for unknown activity
4. Contact support@deskillz.games
5. Consider moving funds to a new wallet

Report Suspicious Activity:
- Email: security@deskillz.games
- Include details and screenshots`,
                category: 'FAQ',
                tags: ['security', 'safety', 'account', 'protect', 'scam'],
            },
        ];
        for (const entry of knowledgeEntries) {
            try {
                await this.createKnowledge({
                    title: entry.title,
                    content: entry.content,
                    category: entry.category,
                    tags: entry.tags,
                    source: 'system-seed',
                });
            }
            catch (error) {
                this.logger.error(`Failed to seed knowledge: ${entry.title}`, error);
            }
        }
        this.logger.log(`Knowledge base seeded with ${knowledgeEntries.length} entries`);
    }
};
exports.AIKnowledgeService = AIKnowledgeService;
exports.AIKnowledgeService = AIKnowledgeService = AIKnowledgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AIKnowledgeService);
//# sourceMappingURL=ai-knowledge.service.js.map