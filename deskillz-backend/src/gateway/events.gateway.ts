import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT, RedisKeys } from '../config/redis.module';
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

interface MatchFound {
  matchId: string;
  tournamentId: string;
  players: Array<{ userId: string; username: string }>;
  gameId: string;
  startTime: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://deskillz.games',
    ],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  afterInit(server: Server) {
    this.logger.log('🔌 WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without auth`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // Get user info
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true, status: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        client.emit('error', { message: 'Invalid user' });
        client.disconnect();
        return;
      }

      // Attach user info to socket
      client.userId = user.id;
      client.username = user.username;

      // Store socket mapping in Redis
      await this.redis.set(
        RedisKeys.socketUser(user.id),
        client.id,
        'EX',
        86400, // 24 hours
      );

      // Join user's personal room
      client.join(`user:${user.id}`);

      this.logger.log(`✅ User ${user.username} connected (${client.id})`);

      // Send connection success
      client.emit('connected', {
        userId: user.id,
        username: user.username,
        socketId: client.id,
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove from Redis
      await this.redis.del(RedisKeys.socketUser(client.userId));

      // Remove from matchmaking queues
      await this.removeFromMatchmaking(client.userId);

      this.logger.log(`User ${client.username} disconnected (${client.id})`);
    }
  }

  // ==========================================
  // MATCHMAKING
  // ==========================================

  @SubscribeMessage('matchmaking:join')
  async handleJoinMatchmaking(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: MatchmakingRequest,
  ) {
    if (!client.userId) {
      return { error: 'Not authenticated' };
    }

    const { gameId, mode, entryFee, currency } = data;

    // Validate game exists
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, name: true, minPlayers: true, maxPlayers: true },
    });

    if (!game) {
      return { error: 'Game not found' };
    }

    // Create matchmaking key
    const queueKey = RedisKeys.matchmakingQueue(gameId, mode);

    // Add user to queue with timestamp
    const userEntry = JSON.stringify({
      userId: client.userId,
      username: client.username,
      joinedAt: Date.now(),
      entryFee,
      currency,
    });

    await this.redis.zadd(queueKey, Date.now(), userEntry);
    await this.redis.set(
      RedisKeys.matchmakingUser(client.userId),
      queueKey,
      'EX',
      3600,
    );

    // Join matchmaking room
    client.join(`matchmaking:${gameId}:${mode}`);

    this.logger.log(
      `User ${client.username} joined matchmaking for ${game.name} (${mode})`,
    );

    // Try to find a match
    await this.tryMatchPlayers(gameId, mode, game.minPlayers);

    return { success: true, message: 'Joined matchmaking queue' };
  }

  @SubscribeMessage('matchmaking:leave')
  async handleLeaveMatchmaking(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Not authenticated' };
    }

    await this.removeFromMatchmaking(client.userId);

    return { success: true, message: 'Left matchmaking queue' };
  }

  private async removeFromMatchmaking(userId: string) {
    const queueKey = await this.redis.get(RedisKeys.matchmakingUser(userId));
    if (queueKey) {
      // Get all entries and remove user's entry
      const entries = await this.redis.zrange(queueKey, 0, -1);
      for (const entry of entries) {
        const parsed = JSON.parse(entry);
        if (parsed.userId === userId) {
          await this.redis.zrem(queueKey, entry);
          break;
        }
      }
      await this.redis.del(RedisKeys.matchmakingUser(userId));
    }
  }

  private async tryMatchPlayers(
    gameId: string,
    mode: string,
    minPlayers: number,
  ) {
    const queueKey = RedisKeys.matchmakingQueue(gameId, mode);

    // Get players in queue
    const entries = await this.redis.zrange(queueKey, 0, minPlayers - 1);

    if (entries.length >= minPlayers) {
      const players = entries.map((e) => JSON.parse(e));

      // Create a match/tournament
      const matchId = `match_${Date.now()}`;

      // Notify all matched players
      const matchData: MatchFound = {
        matchId,
        tournamentId: '', // Would be created in production
        players: players.map((p) => ({
          userId: p.userId,
          username: p.username,
        })),
        gameId,
        startTime: new Date(Date.now() + 10000), // Start in 10 seconds
      };

      // Remove matched players from queue
      for (const entry of entries) {
        await this.redis.zrem(queueKey, entry);
        const player = JSON.parse(entry);
        await this.redis.del(RedisKeys.matchmakingUser(player.userId));
      }

      // Notify players
      for (const player of players) {
        this.server.to(`user:${player.userId}`).emit('match:found', matchData);
      }

      // Create match room
      const matchRoom = `match:${matchId}`;
      for (const player of players) {
        const socketId = await this.redis.get(
          RedisKeys.socketUser(player.userId),
        );
        if (socketId) {
          const socket = this.server.sockets.sockets.get(socketId);
          socket?.join(matchRoom);
        }
      }

      this.logger.log(
        `Match created: ${matchId} with ${players.length} players`,
      );
    }
  }

  // ==========================================
  // TOURNAMENT EVENTS
  // ==========================================

  @SubscribeMessage('tournament:join')
  async handleJoinTournamentRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tournamentId: string },
  ) {
    if (!client.userId) {
      return { error: 'Not authenticated' };
    }

    client.join(`tournament:${data.tournamentId}`);
    return { success: true };
  }

  @SubscribeMessage('tournament:leave')
  async handleLeaveTournamentRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tournamentId: string },
  ) {
    client.leave(`tournament:${data.tournamentId}`);
    return { success: true };
  }

  // ==========================================
  // GAME ROOM EVENTS
  // ==========================================

  @SubscribeMessage('game:action')
  async handleGameAction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string; action: string; payload: any },
  ) {
    if (!client.userId) {
      return { error: 'Not authenticated' };
    }

    // Broadcast action to all players in match
    this.server.to(`match:${data.matchId}`).emit('game:action', {
      userId: client.userId,
      username: client.username,
      action: data.action,
      payload: data.payload,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  @SubscribeMessage('game:score')
  async handleGameScore(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string; score: number },
  ) {
    if (!client.userId) {
      return { error: 'Not authenticated' };
    }

    // Broadcast score update to all players in match
    this.server.to(`match:${data.matchId}`).emit('game:score_update', {
      userId: client.userId,
      username: client.username,
      score: data.score,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  // ==========================================
  // BROADCAST METHODS (called from services)
  // ==========================================

  /**
   * Send notification to specific user
   */
  async sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Broadcast to tournament room
   */
  async broadcastToTournament(tournamentId: string, event: string, data: any) {
    this.server.to(`tournament:${tournamentId}`).emit(event, data);
  }

  /**
   * Broadcast to match room
   */
  async broadcastToMatch(matchId: string, event: string, data: any) {
    this.server.to(`match:${matchId}`).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  async broadcastAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  /**
   * Get online user count
   */
  async getOnlineCount(): Promise<number> {
    const sockets = await this.server.fetchSockets();
    return sockets.length;
  }
}
