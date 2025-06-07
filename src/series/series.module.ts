import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Serie } from './entities/serie.entity';
import { SeriesAdminController } from './admin/series-admin.controller';
import { SeriesAdminService } from './admin/series-admin.service';
import { GenresModule } from 'src/genres/genres.module';
import { AdminsModule } from 'src/admins/admins.module';
import { EpisodesModule } from 'src/episodes/episodes.module';
import { SeasonsModule } from 'src/seasons/seasons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Serie]),
    AdminsModule,
    GenresModule,
    EpisodesModule,
    SeasonsModule,
  ],
  controllers: [
    SeriesController, 
    SeriesAdminController, 
  ],
  providers: [
    SeriesService, 
    SeriesAdminService,
  ],
  exports: [
    SeriesAdminService,
  ]
})
export class SeriesModule {}
