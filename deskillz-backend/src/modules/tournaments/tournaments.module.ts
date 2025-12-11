import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { TournamentProcessor } from './tournaments.processor';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [
    GamesModule,
    BullModule.registerQueue({
      name: 'tournaments',
    }),
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService, TournamentProcessor],
  exports: [TournamentsService],
})
export class TournamentsModule {}
