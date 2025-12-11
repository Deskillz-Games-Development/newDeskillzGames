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
   - Play matches and compete
   - Your scores are automatically submitted
   - Winnings go directly to your connected wallet

Remember: You CANNOT join tournaments on the website. You must download the game app and join tournaments from within the game itself.`,
                category: 'GENERAL',
                tags: ['website', 'app', 'difference', 'mobile', 'play'],
            },
            {
                title: 'How to Get Started as a Player',
                content: `Getting started on Deskillz.games:

Step 1: Create an Account
- Visit deskillz.games and click "Sign Up"
- Connect your crypto wallet (MetaMask, WalletConnect, etc.)
- Your wallet address becomes your unique identifier

Step 2: Browse Games
- Go to the Games page on the website
- Browse games by genre, popularity, or entry fee range
- Read game descriptions and check tournament schedules

Step 3: Download a Game
- Click on a game you want to play
- Click the "Download" button (Android or iOS)
- Install the game on your mobile device

Step 4: Open the Game and Connect
- Launch the game on your phone
- Sign in with your Deskillz account
- The game will connect to your wallet automatically

Step 5: Join Tournaments (IN THE GAME APP)
- Browse available tournaments within the game
- Select a tournament and pay the entry fee
- Play your best and compete for prizes!`,
                category: 'PLAYER_GUIDE',
                tags: ['getting started', 'new player', 'beginner', 'start', 'account'],
            },
            {
                title: 'How to Connect Your Wallet',
                content: `To connect your cryptocurrency wallet to Deskillz.games:

On the Website:
1. Click the "Connect Wallet" button in the top right corner
2. Choose your wallet provider:
   - MetaMask (browser extension)
   - WalletConnect (mobile wallets)
   - Coinbase Wallet
   - Rainbow
   - Trust Wallet
3. Approve the connection request in your wallet
4. Once connected, your wallet address and balance will display

Your wallet is used for:
- Paying tournament entry fees (in the game apps)
- Receiving prize winnings
- Depositing and withdrawing funds
- Verifying your identity

Supported Networks:
- Ethereum Mainnet
- Polygon
- BNB Smart Chain (BSC)
- Arbitrum
- Optimism
- Base

Tip: Make sure you have some native tokens (ETH, BNB, etc.) for gas fees when making transactions.`,
                category: 'WALLET',
                tags: ['wallet', 'connect', 'metamask', 'walletconnect', 'setup'],
            },
            {
                title: 'How to Join a Tournament',
                content: `IMPORTANT: Tournaments can ONLY be joined from within the game app, NOT on the website.

How to join a tournament:

Step 1: Download the Game
- Find the game on deskillz.games
- Download it from Google Play Store or Apple App Store
- Install and open the game

Step 2: Sign In
- Open the game on your mobile device
- Sign in with your Deskillz account
- Make sure your wallet is connected

Step 3: Browse Tournaments (IN THE GAME)
- Look for the "Tournaments" or "Compete" section in the game
- Browse available tournaments
- Check entry fees, prize pools, and player counts

Step 4: Join a Tournament
- Select a tournament you want to enter
- Review the entry fee and rules
- Confirm payment from your connected wallet
- Wait for the tournament to start or play immediately (depending on type)

Step 5: Play and Compete
- Play your best when the match begins
- Your score is automatically submitted
- Check the leaderboard to see your ranking
- Prizes are distributed after the tournament ends

Tournament Types:
- Synchronous: Real-time matches against live opponents
- Asynchronous: Play before the deadline, highest score wins`,
                category: 'TOURNAMENT',
                tags: ['tournament', 'join', 'enter', 'play', 'compete'],
            },
            {
                title: 'Tournament Types Explained',
                content: `Deskillz offers two types of tournaments:

1. SYNCHRONOUS (Real-Time) Tournaments
- You play against opponents in real-time
- Matches happen simultaneously
- Both players compete at the same moment
- Best for: Head-to-head competitive games
- Example: Racing games, fighting games, puzzle battles

2. ASYNCHRONOUS (Play Anytime) Tournaments
- Play your match anytime before the deadline
- Your score is recorded and compared to others
- No need to be online at the same time as opponents
- Best for: Score-based games, single-player challenges
- Example: High score games, puzzle games, arcade games

Entry Fee Tiers:
- Free Practice: No entry fee, no prizes (for learning)
- Micro: $0.60 - $2 entry fees
- Low: $2 - $10 entry fees
- Medium: $10 - $50 entry fees
- High: $50+ entry fees

Higher entry fees = larger prize pools!`,
                category: 'TOURNAMENT',
                tags: ['tournament', 'types', 'sync', 'async', 'synchronous', 'asynchronous'],
            },
            {
                title: 'Understanding Prize Pools and Payouts',
                content: `How prize pools work on Deskillz:

Prize Pool Calculation:
- All entry fees are collected into the prize pool
- Platform takes a service fee (5-15% depending on tournament)
- Remaining amount is distributed to winners

Typical Prize Distribution:
- 1st Place: 50% of prize pool
- 2nd Place: 30% of prize pool  
- 3rd Place: 20% of prize pool
(Distribution varies by tournament size)

Payout Process:
- Winnings are credited immediately after tournament ends
- Funds go to your connected wallet balance
- You can withdraw anytime from your profile
- Minimum withdrawal varies by cryptocurrency

Supported Prize Currencies:
- ETH, BTC, BNB, SOL, XRP, USDT, USDC
- Prizes paid in the same currency as entry fee

Note: All transactions happen through the game app and are secured by blockchain technology.`,
                category: 'TOURNAMENT',
                tags: ['prize', 'payout', 'winnings', 'rewards', 'money'],
            },
            {
                title: 'Depositing Funds',
                content: `To add funds to your Deskillz wallet:

Method 1: Direct Deposit
1. Go to your Profile on deskillz.games
2. Click "Deposit" or "Add Funds"
3. Select the cryptocurrency you want to deposit
4. Copy your deposit address or scan the QR code
5. Send funds from your external wallet to this address
6. Wait for blockchain confirmation (varies by network)

Method 2: Through the Game App
1. Open any Deskillz game on your phone
2. Go to the wallet/balance section
3. Tap "Add Funds" or "Deposit"
4. Follow the prompts to complete the deposit

Supported Cryptocurrencies:
- ETH (Ethereum)
- BTC (Bitcoin - wrapped)
- BNB (BNB Chain)
- SOL (Solana)
- XRP (Ripple)
- USDT (Tether)
- USDC (USD Coin)

Processing Times:
- Most deposits confirm within 5-30 minutes
- Depends on blockchain network congestion
- You'll receive a notification when funds arrive`,
                category: 'WALLET',
                tags: ['deposit', 'add funds', 'money', 'crypto', 'transfer'],
            },
            {
                title: 'Withdrawing Your Winnings',
                content: `To withdraw your tournament winnings:

Step 1: Go to Your Profile
- Visit deskillz.games and sign in
- Go to Profile > Wallet or Transactions

Step 2: Initiate Withdrawal
- Click "Withdraw"
- Select the cryptocurrency to withdraw
- Enter the amount
- Confirm your destination wallet address

Step 3: Confirm Transaction
- Review the withdrawal details
- Check the network fee estimate
- Confirm the withdrawal

Important Information:
- Minimum withdrawal: 10 USDT equivalent
- Processing time: Usually 1-24 hours
- Network fees apply (deducted from withdrawal)
- Withdrawals go to your connected wallet address

Security Tips:
- Always double-check the destination address
- Start with a small test withdrawal if unsure
- Keep your wallet secure and never share private keys`,
                category: 'WALLET',
                tags: ['withdraw', 'payout', 'cash out', 'funds', 'winnings'],
            },
            {
                title: 'Supported Cryptocurrencies',
                content: `Deskillz.games supports the following cryptocurrencies:

For Entry Fees and Prizes:
- ETH (Ethereum) - Most popular, widely supported
- BTC (Bitcoin) - Via wrapped version
- BNB (BNB Chain) - Low fees
- SOL (Solana) - Fast transactions
- XRP (Ripple) - Quick settlements
- USDT (Tether) - Stable value, pegged to USD
- USDC (USD Coin) - Stable value, pegged to USD

Supported Blockchain Networks:
- Ethereum Mainnet
- Polygon (MATIC) - Low gas fees
- BNB Smart Chain - Low gas fees
- Arbitrum - Layer 2, low fees
- Optimism - Layer 2, low fees
- Base - Coinbase Layer 2

Stablecoins (USDT/USDC) are recommended for:
- Predictable tournament costs
- Stable prize values
- No price volatility concerns

Note: Make sure you're using the correct network when depositing to avoid lost funds!`,
                category: 'WALLET',
                tags: ['crypto', 'cryptocurrency', 'supported', 'coins', 'tokens', 'network'],
            },
            {
                title: 'Developer Portal Overview',
                content: `The Deskillz Developer Portal allows game developers to integrate their games and earn revenue.

Accessing the Developer Portal:
- Visit deskillz.games/developer
- Sign up for a developer account
- Verify your email and complete profile

Developer Portal Features:
1. Dashboard - Overview of all your games and revenue
2. My Games - Manage your integrated games
3. SDK Downloads - Get Unity and Unreal SDKs
4. API Documentation - Technical integration guides
5. Revenue Reports - Track earnings and payouts
6. Analytics - Player engagement and metrics

Revenue Model:
- Developers earn 70% of tournament fees
- Platform takes 30%
- Monthly payouts to your wallet
- Minimum payout: 100 USDT equivalent

Getting Started:
1. Create a developer account
2. Download the SDK for your game engine
3. Integrate the SDK into your game
4. Submit your game for review
5. Once approved, start earning!`,
                category: 'DEVELOPER_SDK',
                tags: ['developer', 'portal', 'overview', 'account', 'revenue'],
            },
            {
                title: 'Unity SDK Integration Guide',
                content: `Integrating the Deskillz SDK into your Unity game:

Step 1: Download the SDK
- Go to Developer Portal > SDK Downloads
- Download the Unity SDK package (.unitypackage)

Step 2: Import into Unity
- Open your Unity project
- Assets > Import Package > Custom Package
- Select the downloaded SDK package
- Import all files

Step 3: Initialize the SDK
Add this code to your game's initialization:

DeskillzSDK.Initialize("YOUR_GAME_ID", "YOUR_API_KEY");

Step 4: Handle Tournament Events
DeskillzSDK.Tournament.OnMatchStart += (matchInfo) => {
    // matchInfo.mode (sync/async)
    // matchInfo.players[]
    // matchInfo.tournamentId
    StartGame(matchInfo);
};

Step 5: Submit Scores
When gameplay ends, submit the score:

DeskillzSDK.Score.Submit(
    score: playerScore,
    metadata: gameStateHash,
    onSuccess: () => ShowResults(),
    onError: (err) => HandleError(err)
);

Step 6: Test in Sandbox
- Use sandbox mode for testing
- No real money transactions
- Test all tournament flows

Step 7: Submit for Review
- Upload your build to the Developer Portal
- Our team reviews within 2-3 business days`,
                category: 'DEVELOPER_SDK',
                tags: ['unity', 'sdk', 'integration', 'developer', 'code'],
            },
            {
                title: 'Unreal Engine SDK Integration Guide',
                content: `Integrating the Deskillz SDK into your Unreal Engine game:

Step 1: Download the Plugin
- Go to Developer Portal > SDK Downloads
- Download the Unreal Engine plugin

Step 2: Install the Plugin
- Copy the plugin to your project's Plugins folder
- Restart Unreal Editor
- Enable the plugin in Edit > Plugins

Step 3: Configure Settings
- Go to Project Settings > Deskillz
- Enter your Game ID and API Key
- Configure tournament settings

Step 4: Initialize in GameMode
In your GameMode's BeginPlay:

void AMyGameMode::BeginPlay()
{
    Super::BeginPlay();
    UDeskillzSDK::Initialize();
}

Step 5: Handle Tournament Events
Bind to tournament events:

UDeskillzSDK::OnMatchStart.AddDynamic(
    this, &AMyGameMode::HandleMatchStart
);

Step 6: Submit Scores
When the match ends:

UDeskillzSDK::SubmitScore(FinalScore, GameMetadata);

Testing:
- Enable Sandbox Mode in project settings
- Test all flows before submission
- Check logs for any SDK errors

Submit for Review:
- Package your game for mobile (Android/iOS)
- Upload to Developer Portal
- Review takes 2-3 business days`,
                category: 'DEVELOPER_SDK',
                tags: ['unreal', 'sdk', 'integration', 'developer', 'code'],
            },
            {
                title: 'Game Submission and Review Process',
                content: `Submitting your game to Deskillz for review:

Before Submission Checklist:
□ SDK properly integrated and tested
□ All tournament modes working (sync/async as applicable)
□ Score submission accurate and tamper-proof
□ Game tested in sandbox mode
□ No crashes or critical bugs
□ Appropriate content (no adult/violent content)

Submission Steps:
1. Go to Developer Portal > My Games
2. Click "Add New Game"
3. Fill in game details:
   - Game name and description
   - Genre and tags
   - Screenshots (at least 3)
   - Video trailer (recommended)
   - Supported platforms (Android/iOS)
4. Upload your game build
5. Submit for review

Review Process:
- Initial review: 2-3 business days
- We test:
  • SDK integration correctness
  • Tournament flow functionality
  • Score submission integrity
  • Fair play compliance
  • User experience quality

Possible Outcomes:
- Approved: Your game goes live!
- Changes Requested: Fix issues and resubmit
- Rejected: Major issues or policy violations

After Approval:
- Your game appears in the Games catalog
- Players can download and compete
- You start earning revenue immediately!`,
                category: 'DEVELOPER_SDK',
                tags: ['submit', 'review', 'approval', 'publish', 'developer'],
            },
            {
                title: 'Developer Revenue and Payouts',
                content: `Understanding developer revenue on Deskillz:

Revenue Share Model:
- Developers receive: 70%
- Platform receives: 30%
- Calculated from tournament entry fees

Example:
- Tournament entry fee: $10
- 10 players = $100 total collected
- Platform service fee: 15% = $15
- Prize pool: $85
- From the $15 service fee:
  • Developer gets: $10.50 (70%)
  • Platform keeps: $4.50 (30%)

Tracking Your Revenue:
- Developer Portal > Revenue Dashboard
- View daily, weekly, monthly earnings
- See breakdown by game and tournament
- Download CSV reports for accounting

Payout Schedule:
- Payouts processed monthly
- Minimum threshold: 100 USDT equivalent
- Paid to your connected wallet
- Payment in your preferred cryptocurrency

Revenue Analytics:
- Total revenue earned
- Revenue by game
- Revenue trends over time
- Player engagement metrics
- Tournament participation stats

Tips to Maximize Revenue:
- Create engaging, replayable games
- Support both sync and async modes
- Optimize for mobile performance
- Promote your game to players`,
                category: 'DEVELOPER_SDK',
                tags: ['revenue', 'earnings', 'payout', 'money', 'developer', 'income'],
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
                title: 'Game App Installation Issues',
                content: `Troubleshooting game installation problems:

Android Issues:

"App Not Installing"
- Check available storage space
- Enable "Install from unknown sources" if downloading APK
- Clear Google Play Store cache
- Restart your device

"App Crashing"
- Check device meets minimum requirements
- Update to latest Android version
- Clear app cache and data
- Reinstall the app

iOS Issues:

"Can't Download from App Store"
- Check your Apple ID is signed in
- Verify device compatibility
- Check available storage
- Restart device and try again

"App Won't Open"
- Force close and reopen
- Check for iOS updates
- Restart device
- Delete and reinstall

General Tips:
- Ensure stable internet connection
- Keep your device's OS updated
- Check game's minimum requirements
- Free up storage space if needed

Download Links:
- Find games at deskillz.games/games
- Click the Android or iOS download button
- You'll be redirected to the app store`,
                category: 'TROUBLESHOOTING',
                tags: ['install', 'download', 'app', 'android', 'ios', 'problem'],
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
✓ Use a strong, unique password
✓ Enable two-factor authentication (2FA)
✓ Use a hardware wallet for large balances
✓ Verify URLs before connecting your wallet
✓ Keep your device's software updated
✓ Log out from shared devices

DON'T:
✗ Never share your wallet seed phrase
✗ Never share your private keys
✗ Never click suspicious links
✗ Never give anyone remote access to your device
✗ Never send crypto to "double your money" offers

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