import { Module } from '@nestjs/common';
import { PartiesService } from './parties.service';
import { PartiesController } from './parties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party } from './entities/party.entity';
import { UsersModule } from 'src/users/users.module';
import { MoviesModule } from 'src/movies/movies.module';
import { EpisodesModule } from 'src/episodes/episodes.module';
import { PartiesAdminController } from './admin/parties-admin.controller';
import { PartiesAdminService } from './admin/parties-admin.service';
import { AdminsModule } from 'src/admins/admins.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Party]),
        AdminsModule,
        UsersModule,
        MoviesModule,
        EpisodesModule,
    ],
    controllers: [PartiesController, PartiesAdminController],
    providers: [PartiesService, PartiesAdminService],
})
export class PartiesModule {}
