import { Module } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { GenresAdminController } from './admin/genres-admin.controller';
import { GenresAdminService } from './admin/genres-admin.service';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Genre]),
    AdminModule,
  ],
  controllers: [GenresController, GenresAdminController],
  providers: [GenresService, GenresAdminService],
  exports: [GenresAdminService]
})
export class GenresModule {}
