import { Module } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { EpisodesController } from './episodes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Episode } from './entities/episode.entity';
import { EpisodesAdminController } from './admin/episodes-admin.controller';
import { EpisodesAdminService } from './admin/episodes-admin.service';
import { SeasonsModule } from 'src/seasons/seasons.module';
import { AdminsModule } from 'src/admins/admins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Episode]), 
    SeasonsModule,
    AdminsModule,
  ],
  controllers: [EpisodesController, EpisodesAdminController],
  providers: [EpisodesService, EpisodesAdminService],
  exports: [EpisodesAdminService],
})
export class EpisodesModule {}
