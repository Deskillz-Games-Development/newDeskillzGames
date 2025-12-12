import { Queue } from 'bull';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTournamentDto, TournamentQueryDto, TournamentResponseDto, TournamentListResponseDto, JoinTournamentDto, SubmitScoreDto, TournamentEntryResponseDto, LeaderboardEntryDto } from './dto/tournaments.dto';
export declare class TournamentsService {
    private readonly prisma;
    private readonly redis;
    private readonly tournamentQueue;
    constructor(prisma: PrismaService, redis: Redis, tournamentQueue: Queue);
    create(dto: CreateTournamentDto): Promise<TournamentResponseDto>;
    findAll(query: TournamentQueryDto): Promise<TournamentListResponseDto>;
    findById(id: string): Promise<TournamentResponseDto>;
    join(tournamentId: string, userId: string, dto: JoinTournamentDto): Promise<TournamentEntryResponseDto>;
    leave(tournamentId: string, userId: string): Promise<void>;
    submitScore(tournamentId: string, userId: string, dto: SubmitScoreDto): Promise<void>;
    getLeaderboard(tournamentId: string): Promise<LeaderboardEntryDto[]>;
    getUserEntries(userId: string): Promise<TournamentEntryResponseDto[]>;
    getActiveByGame(gameId: string): Promise<TournamentResponseDto[]>;
    private toTournamentResponse;
    private toEntryResponse;
}
