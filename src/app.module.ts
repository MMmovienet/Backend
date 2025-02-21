import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { IsUniqueConstraint } from './common/validators/is-unique.constraint ';
import { UsersModule } from './users/users.module';
import { GenresModule } from './genres/genres.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
        ConfigModule.forRoot({isGlobal: true}),
        DatabaseModule,
        AdminModule,
        UsersModule,
        GenresModule,
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint],
})
export class AppModule {}
