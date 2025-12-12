import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    username?: string;
}
interface MatchmakingRequest {
    gameId: string;
    mode: 'SYNC' | 'ASYNC';
    entryFee?: number;
    currency?: string;
}
export declare class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    private readonly prisma;
    private readonly redis;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, prisma: PrismaService, redis: Redis);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinMatchmaking(client: AuthenticatedSocket, data: MatchmakingRequest): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    handleLeaveMatchmaking(client: AuthenticatedSocket): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    private removeFromMatchmaking;
    private tryMatchPlayers;
    handleJoinTournamentRoom(client: AuthenticatedSocket, data: {
        tournamentId: string;
    }): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    handleLeaveTournamentRoom(client: AuthenticatedSocket, data: {
        tournamentId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleGameAction(client: AuthenticatedSocket, data: {
        matchId: string;
        action: string;
        payload: any;
    }): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    handleGameScore(client: AuthenticatedSocket, data: {
        matchId: string;
        score: number;
    }): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    sendToUser(userId: string, event: string, data: any): Promise<void>;
    broadcastToTournament(tournamentId: string, event: string, data: any): Promise<void>;
    broadcastToMatch(matchId: string, event: string, data: any): Promise<void>;
    broadcastAll(event: string, data: any): Promise<void>;
    getOnlineCount(): Promise<number>;
}
export {};
