import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Vote } from './entities/vote.entity';
import { MoviesModule } from 'src/movies/movies.module';
import { SeriesModule } from 'src/series/series.module';
import { PostsAdminService } from './admin/posts-admin.service';
import { PostsAdminController } from './admin/posts-admin.controller';
import { AdminsModule } from 'src/admins/admins.module';
import { UsersModule } from 'src/users/users.module';
import { VoteRealtimeGateway } from 'src/common/realtime/vote-realtime.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Vote]),
    AdminsModule,
    forwardRef(() => UsersModule),
    MoviesModule,
    SeriesModule,
  ],
  controllers: [PostsController, PostsAdminController],
  providers: [PostsService, PostsAdminService, VoteRealtimeGateway],
  exports: [PostsService]
})
export class PostsModule {}
