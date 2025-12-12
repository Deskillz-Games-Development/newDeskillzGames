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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TournamentProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_module_1 = require("../../config/redis.module");
const client_1 = require("@prisma/client");
let TournamentProcessor = TournamentProcessor_1 = class TournamentProcessor {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.logger = new common_1.Logger(TournamentProcessor_1.name);
    }
    async handleStartTournament(job) {
        const { tournamentId } = job.data;
        this.logger.log(`Starting tournament: ${tournamentId}`);
        try {
            const tournament = await this.prisma.tournament.findUnique({
                where: { id: tournamentId },
                include: { entries: true },
            });
            if (!tournament) {
                this.logger.error(`Tournament not found: ${tournamentId}`);
                return;
            }
            if (tournament.currentPlayers < tournament.minPlayers) {
                this.logger.log(`Tournament ${tournamentId} cancelled - not enough players`);
                await this.prisma.tournament.update({
                    where: { id: tournamentId },
                    data: { status: client_1.TournamentStatus.CANCELLED },
                });
                await this.refundAllEntries(tournament.entries);
                return;
            }
            await this.prisma.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: client_1.TournamentStatus.IN_PROGRESS,
                    actualStart: new Date(),
                },
            });
            await this.prisma.tournamentEntry.updateMany({
                where: {
                    tournamentId,
                    status: client_1.EntryStatus.CONFIRMED,
                },
                data: {
                    status: client_1.EntryStatus.PLAYING,
                    startedAt: new Date(),
                },
            });
            await this.redis.del(redis_module_1.RedisKeys.tournament(tournamentId));
            this.logger.log(`Tournament ${tournamentId} started successfully`);
        }
        catch (error) {
            this.logger.error(`Error starting tournament ${tournamentId}:`, error);
            throw error;
        }
    }
    async handleEndTournament(job) {
        const { tournamentId } = job.data;
        this.logger.log(`Ending tournament: ${tournamentId}`);
        try {
            const tournament = await this.prisma.tournament.findUnique({
                where: { id: tournamentId },
                include: {
                    entries: {
                        where: { status: client_1.EntryStatus.COMPLETED },
                        include: { user: true },
                    },
                },
            });
            if (!tournament) {
                this.logger.error(`Tournament not found: ${tournamentId}`);
                return;
            }
            const scores = await this.prisma.gameScore.findMany({
                where: { tournamentId },
                orderBy: { score: 'desc' },
            });
            const prizeDistribution = tournament.prizeDistribution;
            const prizePool = parseFloat(tournament.prizePool.toString());
            const platformFee = prizePool *
                (parseFloat(tournament.platformFeePercent.toString()) / 100);
            const distributablePool = prizePool - platformFee;
            for (let i = 0; i < scores.length; i++) {
                const rank = i + 1;
                const percentShare = prizeDistribution[rank.toString()] || 0;
                if (percentShare > 0) {
                    const prize = (distributablePool * percentShare) / 100;
                    await this.prisma.tournamentEntry.updateMany({
                        where: {
                            tournamentId,
                            userId: scores[i].userId,
                        },
                        data: {
                            finalRank: rank,
                            prizeWon: prize,
                        },
                    });
                    this.logger.log(`Prize queued: ${prize} ${tournament.prizeCurrency} to user ${scores[i].userId}`);
                }
                else {
                    await this.prisma.tournamentEntry.updateMany({
                        where: {
                            tournamentId,
                            userId: scores[i].userId,
                        },
                        data: {
                            finalRank: rank,
                        },
                    });
                }
            }
            await this.prisma.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: client_1.TournamentStatus.COMPLETED,
                    actualEnd: new Date(),
                    platformFeeAmount: platformFee,
                },
            });
            for (const score of scores) {
                const entry = tournament.entries.find((e) => e.userId === score.userId);
                if (entry) {
                    await this.prisma.user.update({
                        where: { id: score.userId },
                        data: {
                            totalMatches: { increment: 1 },
                            totalWins: score.userId === scores[0].userId ? { increment: 1 } : undefined,
                            totalEarnings: entry.prizeWon
                                ? { increment: parseFloat(entry.prizeWon.toString()) }
                                : undefined,
                        },
                    });
                }
            }
            await this.redis.del(redis_module_1.RedisKeys.tournament(tournamentId));
            await this.redis.del(redis_module_1.RedisKeys.tournamentLeaderboard(tournamentId));
            this.logger.log(`Tournament ${tournamentId} completed successfully`);
        }
        catch (error) {
            this.logger.error(`Error ending tournament ${tournamentId}:`, error);
            throw error;
        }
    }
    async handleRefund(job) {
        const { entryId, userId, amount, currency } = job.data;
        this.logger.log(`Processing refund for entry: ${entryId}`);
        try {
            await this.prisma.transaction.create({
                data: {
                    userId,
                    type: 'REFUND',
                    amount: amount,
                    currency: currency,
                    status: 'PENDING',
                    referenceType: 'tournament_entry',
                    referenceId: entryId,
                    description: 'Tournament entry refund',
                },
            });
            this.logger.log(`Refund queued: ${amount} ${currency} to user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Error processing refund for entry ${entryId}:`, error);
            throw error;
        }
    }
    async refundAllEntries(entries) {
        for (const entry of entries) {
            if (entry.status === client_1.EntryStatus.CONFIRMED) {
                await this.prisma.tournamentEntry.update({
                    where: { id: entry.id },
                    data: { status: client_1.EntryStatus.REFUNDED },
                });
                await this.prisma.transaction.create({
                    data: {
                        userId: entry.userId,
                        type: 'REFUND',
                        amount: entry.entryAmount,
                        currency: entry.entryCurrency,
                        status: 'PENDING',
                        referenceType: 'tournament_entry',
                        referenceId: entry.id,
                        description: 'Tournament cancelled - automatic refund',
                    },
                });
            }
        }
    }
};
exports.TournamentProcessor = TournamentProcessor;
__decorate([
    (0, bull_1.Process)('start-tournament'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TournamentProcessor.prototype, "handleStartTournament", null);
__decorate([
    (0, bull_1.Process)('end-tournament'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TournamentProcessor.prototype, "handleEndTournament", null);
__decorate([
    (0, bull_1.Process)('process-refund'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TournamentProcessor.prototype, "handleRefund", null);
exports.TournamentProcessor = TournamentProcessor = TournamentProcessor_1 = __decorate([
    (0, bull_1.Processor)('tournaments'),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_1.default])
], TournamentProcessor);
//# sourceMappingURL=tournaments.processor.js.map