"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    app: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3001', 10),
        apiPrefix: process.env.API_PREFIX || 'api/v1',
    },
    database: {
        url: process.env.DATABASE_URL,
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },
    siwe: {
        domain: process.env.SIWE_DOMAIN || 'deskillz.games',
        statement: process.env.SIWE_STATEMENT || 'Sign in to Deskillz.games',
    },
    blockchain: {
        ethereum: process.env.ETH_RPC_URL,
        polygon: process.env.POLYGON_RPC_URL,
        bsc: process.env.BSC_RPC_URL,
        arbitrum: process.env.ARBITRUM_RPC_URL,
        tron: process.env.TRON_RPC_URL,
    },
    contracts: {
        tronUsdt: process.env.TRON_USDT_CONTRACT,
        tournamentEscrow: process.env.TOURNAMENT_ESCROW_CONTRACT,
    },
    platformWallet: {
        address: process.env.PLATFORM_WALLET_ADDRESS,
        privateKey: process.env.PLATFORM_WALLET_PRIVATE_KEY,
    },
    storage: {
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION,
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
        endpoint: process.env.S3_ENDPOINT,
    },
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },
    cors: {
        origins: process.env.CORS_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'https://deskillz.games',
        ],
    },
    socket: {
        port: parseInt(process.env.SOCKET_PORT || '3002', 10),
    },
    platform: {
        feePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || '10'),
        minEntryFeeUsd: parseFloat(process.env.MIN_ENTRY_FEE_USD || '1'),
        maxEntryFeeUsd: parseFloat(process.env.MAX_ENTRY_FEE_USD || '1000'),
    },
});
//# sourceMappingURL=configuration.js.map