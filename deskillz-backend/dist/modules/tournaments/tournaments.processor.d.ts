import { Job } from 'bull';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
export declare class TournamentProcessor {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: Redis);
    handleStartTournament(job: Job<{
        tournamentId: string;
    }>): Promise<void>;
    handleEndTournament(job: Job<{
        tournamentId: string;
    }>): Promise<void>;
    handleRefund(job: Job<{
        entryId: string;
        userId: string;
        amount: any;
        currency: string;
    }>): Promise<void>;
    private refundAllEntries;
}
