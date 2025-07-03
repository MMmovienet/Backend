import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersAdminController } from './admin/users-admin.controller';
import { UsersAdminService } from './admin/users-admin.service';
import { AdminsModule } from 'src/admins/admins.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    AdminsModule,
    forwardRef(() => PostsModule),
  ],
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService, UsersAdminService],
  exports: [UsersAdminService, JwtModule],
})
export class UsersModule {}