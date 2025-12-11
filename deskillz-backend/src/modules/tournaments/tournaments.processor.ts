import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT, RedisKeys } from '../../config/redis.module';
import { TournamentStatus, EntryStatus } from '@prisma/client';

@Processor('tournaments')
export class TournamentProcessor {
  private readonly logger = new Logger(TournamentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * Start a tournament when scheduled time is reached
   */
  @Process('start-tournament')
  async handleStartTournament(job: Job<{ tournamentId: string }>) {
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

      // Check minimum players
      if (tournament.currentPlayers < tournament.minPlayers) {
        this.logger.log(
          `Tournament ${tournamentId} cancelled - not enough players`,
        );

        await this.prisma.tournament.update({
          where: { id: tournamentId },
          data: { status: TournamentStatus.CANCELLED },
        });

        // Refund all entries
        await this.refundAllEntries(tournament.entries);
        return;
      }

      // Start tournament
      await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          status: TournamentStatus.IN_PROGRESS,
          actualStart: new Date(),
        },
      });

      // Update all entries to PLAYING status
      await this.prisma.tournamentEntry.updateMany({
        where: {
          tournamentId,
          status: EntryStatus.CONFIRMED,
        },
        data: {
          status: EntryStatus.PLAYING,
          startedAt: new Date(),
        },
      });

      // Invalidate cache
      await this.redis.del(RedisKeys.tournament(tournamentId));

      this.logger.log(`Tournament ${tournamentId} started successfully`);
    } catch (error) {
      this.logger.error(`Error starting tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * End a tournament and distribute prizes
   */
  @Process('end-tournament')
  async handleEndTournament(job: Job<{ tournamentId: string }>) {
    const { tournamentId } = job.data;
    this.logger.log(`Ending tournament: ${tournamentId}`);

    try {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          entries: {
            where: { status: EntryStatus.COMPLETED },
            include: { user: true },
          },
        },
      });

      if (!tournament) {
        this.logger.error(`Tournament not found: ${tournamentId}`);
        return;
      }

      // Get final leaderboard
      const scores = await this.prisma.gameScore.findMany({
        where: { tournamentId },
        orderBy: { score: 'desc' },
      });

      // Calculate and distribute prizes
      const prizeDistribution = tournament.prizeDistribution as Record<
        string,
        number
      >;
      const prizePool = parseFloat(tournament.prizePool.toString());
      const platformFee =
        prizePool *
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

          // Queue prize payout
          // This would trigger actual blockchain transaction
          this.logger.log(
            `Prize queued: ${prize} ${tournament.prizeCurrency} to user ${scores[i].userId}`,
          );
        } else {
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

      // Update tournament status
      await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          status: TournamentStatus.COMPLETED,
          actualEnd: new Date(),
          platformFeeAmount: platformFee,
        },
      });

      // Update user stats
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

      // Invalidate caches
      await this.redis.del(RedisKeys.tournament(tournamentId));
      await this.redis.del(RedisKeys.tournamentLeaderboard(tournamentId));

      this.logger.log(`Tournament ${tournamentId} completed successfully`);
    } catch (error) {
      this.logger.error(`Error ending tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Process refund for a tournament entry
   */
  @Process('process-refund')
  async handleRefund(
    job: Job<{
      entryId: string;
      userId: string;
      amount: any;
      currency: string;
    }>,
  ) {
    const { entryId, userId, amount, currency } = job.data;
    this.logger.log(`Processing refund for entry: ${entryId}`);

    try {
      // Create refund transaction record
      await this.prisma.transaction.create({
        data: {
          userId,
          type: 'REFUND',
          amount: amount,
          currency: currency as any,
          status: 'PENDING',
          referenceType: 'tournament_entry',
          referenceId: entryId,
          description: 'Tournament entry refund',
        },
      });

      // In production, this would trigger actual blockchain transaction
      this.logger.log(`Refund queued: ${amount} ${currency} to user ${userId}`);
    } catch (error) {
      this.logger.error(`Error processing refund for entry ${entryId}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Refund all entries for a cancelled tournament
   */
  private async refundAllEntries(entries: any[]) {
    for (const entry of entries) {
      if (entry.status === EntryStatus.CONFIRMED) {
        await this.prisma.tournamentEntry.update({
          where: { id: entry.id },
          data: { status: EntryStatus.REFUNDED },
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
}
