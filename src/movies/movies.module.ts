import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { AdminModule } from 'src/admin/admin.module';
import { GenresModule } from 'src/genres/genres.module';
import { MoviesAdminController } from './admin/movies-admin.controller';
import { MoviesAdminService } from './admin/movies-admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),
    AdminModule,
    GenresModule,
  ],
  controllers: [MoviesController, MoviesAdminController],
  providers: [MoviesService, MoviesAdminService],
})
export class MoviesModule {}
