import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { IsUniqueConstraint } from './common/validators/is-unique.constraint ';
import { UsersModule } from './users/users.module';
import { GenresModule } from './genres/genres.module';
import { MoviesModule } from './movies/movies.module';
import { ChatGateway } from './common/chat/chat.gateway';
import { RedisService } from './common/redis/redis.service';
import { AdminsModule } from './admins/admins.module';
import { PartiesModule } from './parties/parties.module';

@Module({
  imports: [
        ConfigModule.forRoot({isGlobal: true}),
        DatabaseModule,
        AdminsModule,
        UsersModule,
        GenresModule,
        MoviesModule,
        PartiesModule,
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint, ChatGateway, RedisService],
  exports: [RedisService],
})
export class AppModule {}
