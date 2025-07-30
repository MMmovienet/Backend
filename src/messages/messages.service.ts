import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messagesRepository: Repository<Message>
  ) {}

  async create(createMessageDto: CreateMessageDto, user: User) {
    const messageInstance = this.messagesRepository.create({
      text: createMessageDto.text,
      user: user,
    });
    return this.messagesRepository.save(messageInstance); 
  }
}
