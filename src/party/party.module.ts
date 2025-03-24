import { Module } from '@nestjs/common';
import { PartyService } from './party.service';
import { PartyController } from './party.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party } from './entities/party.entity';
import { MoviesModule } from 'src/movies/movies.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Party]),
        UsersModule,
        MoviesModule,
    ],
    controllers: [PartyController],
    providers: [PartyService],
})
export class PartyModule {}
