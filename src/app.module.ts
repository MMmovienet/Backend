import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { IsUniqueConstraint } from './common/validators/is-unique.constraint ';
import { UsersModule } from './users/users.module';
import { GenresModule } from './genres/genres.module';
import { MoviesModule } from './movies/movies.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
        ConfigModule.forRoot({isGlobal: true}),
        DatabaseModule,
        AdminModule,
        UsersModule,
        GenresModule,
        MoviesModule,
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint, ChatGateway],
})
export class AppModule {}
