declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD?: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    SIWE_DOMAIN: string;
    CORS_ORIGINS?: string;
    THROTTLE_TTL: number;
    THROTTLE_LIMIT: number;
    PLATFORM_FEE_PERCENT: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
