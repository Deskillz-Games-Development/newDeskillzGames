import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGameDto, UpdateGameDto, GameQueryDto, GameResponseDto, GameListResponseDto } from './dto/games.dto';
export declare class GamesService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: Redis);
    create(developerId: string, dto: CreateGameDto): Promise<GameResponseDto>;
    findAll(query: GameQueryDto): Promise<GameListResponseDto>;
    findById(id: string): Promise<GameResponseDto>;
    findBySlug(slug: string): Promise<GameResponseDto>;
    update(id: string, developerId: string, dto: UpdateGameDto): Promise<GameResponseDto>;
    submitForReview(id: string, developerId: string): Promise<GameResponseDto>;
    approve(id: string): Promise<GameResponseDto>;
    reject(id: string, reason: string): Promise<GameResponseDto>;
    getFeatured(limit?: number): Promise<GameResponseDto[]>;
    private toGameResponse;
    private generateSlug;
}
