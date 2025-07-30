import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { AdminsModule } from 'src/admins/admins.module';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessagesAdminController } from './admin/messages-admin.controller';
import { MessagesAdminService } from './admin/messages-admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    AdminsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [MessagesController, MessagesAdminController],
  providers: [MessagesService, MessagesAdminService],
})
export class MessagesModule {}
