import { Module } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { GenresAdminController } from './admin/genres-admin.controller';
import { GenresAdminService } from './admin/genres-admin.service';
import { AdminsModule } from 'src/admins/admins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Genre]),
    AdminsModule,
  ],
  controllers: [GenresController, GenresAdminController],
  providers: [GenresService, GenresAdminService],
  exports: [GenresAdminService]
})
export class GenresModule {}
