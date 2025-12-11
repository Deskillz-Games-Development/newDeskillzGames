import { GamesService } from './games.service';
import { CreateGameDto, UpdateGameDto, GameQueryDto, RejectGameDto, GameResponseDto, GameListResponseDto } from './dto/games.dto';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    findAll(query: GameQueryDto): Promise<GameListResponseDto>;
    getFeatured(limit?: number): Promise<GameResponseDto[]>;
    findBySlug(slug: string): Promise<GameResponseDto>;
    findById(id: string): Promise<GameResponseDto>;
    create(userId: string, dto: CreateGameDto): Promise<GameResponseDto>;
    update(id: string, userId: string, dto: UpdateGameDto): Promise<GameResponseDto>;
    submitForReview(id: string, userId: string): Promise<GameResponseDto>;
    approve(id: string): Promise<GameResponseDto>;
    reject(id: string, dto: RejectGameDto): Promise<GameResponseDto>;
}
