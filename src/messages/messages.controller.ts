import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { UserGuard } from 'src/common/guards/user.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { MessageDto } from './dto/responses/message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(UserGuard)
  @Serialize(MessageDto, 'Thank you for reaching out')
  create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    return this.messagesService.create(createMessageDto, req.user);
  }
}
