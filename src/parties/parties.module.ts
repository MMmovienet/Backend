import { Module } from '@nestjs/common';
import { PartiesService } from './parties.service';
import { PartiesController } from './parties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party } from './entities/party.entity';
import { UsersModule } from 'src/users/users.module';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Party]),
        UsersModule,
        MoviesModule,
    ],
    controllers: [PartiesController],
    providers: [PartiesService],
})
export class PartiesModule {}
