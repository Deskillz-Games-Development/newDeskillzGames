declare const _default: () => {
    app: {
        nodeEnv: string;
        port: number;
        apiPrefix: string;
    };
    database: {
        url: string | undefined;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string;
        refreshSecret: string | undefined;
        refreshExpiresIn: string;
    };
    siwe: {
        domain: string;
        statement: string;
    };
    blockchain: {
        ethereum: string | undefined;
        polygon: string | undefined;
        bsc: string | undefined;
        arbitrum: string | undefined;
        tron: string | undefined;
    };
    contracts: {
        tronUsdt: string | undefined;
        tournamentEscrow: string | undefined;
    };
    platformWallet: {
        address: string | undefined;
        privateKey: string | undefined;
    };
    storage: {
        bucket: string | undefined;
        region: string | undefined;
        accessKey: string | undefined;
        secretKey: string | undefined;
        endpoint: string | undefined;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
    cors: {
        origins: string[];
    };
    socket: {
        port: number;
    };
    platform: {
        feePercent: number;
        minEntryFeeUsd: number;
        maxEntryFeeUsd: number;
    };
};
export default _default;
