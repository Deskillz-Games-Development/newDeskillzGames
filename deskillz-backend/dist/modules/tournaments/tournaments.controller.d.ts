import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto, TournamentQueryDto, JoinTournamentDto, SubmitScoreDto, TournamentResponseDto, TournamentListResponseDto, TournamentEntryResponseDto, LeaderboardEntryDto } from './dto/tournaments.dto';
export declare class TournamentsController {
    private readonly tournamentsService;
    constructor(tournamentsService: TournamentsService);
    findAll(query: TournamentQueryDto): Promise<TournamentListResponseDto>;
    findById(id: string): Promise<TournamentResponseDto>;
    getLeaderboard(id: string): Promise<LeaderboardEntryDto[]>;
    getActiveByGame(gameId: string): Promise<TournamentResponseDto[]>;
    create(dto: CreateTournamentDto): Promise<TournamentResponseDto>;
    join(id: string, userId: string, dto: JoinTournamentDto): Promise<TournamentEntryResponseDto>;
    leave(id: string, userId: string): Promise<void>;
    submitScore(id: string, userId: string, dto: SubmitScoreDto): Promise<void>;
    getMyEntries(userId: string): Promise<TournamentEntryResponseDto[]>;
}
