import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { AdminsModule } from 'src/admins/admins.module';
import { GenresModule } from 'src/genres/genres.module';
import { MoviesAdminController } from './admin/movies-admin.controller';
import { MoviesAdminService } from './admin/movies-admin.service';
import { Poster } from './entities/poster.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Poster]),
    AdminsModule,
    GenresModule,
  ],
  controllers: [MoviesController, MoviesAdminController],
  providers: [MoviesService, MoviesAdminService],
  exports: [MoviesService]
})
export class MoviesModule {}
