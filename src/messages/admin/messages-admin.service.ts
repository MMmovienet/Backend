import { paginate, PaginateConfig, Paginated, PaginateQuery } from "nestjs-paginate";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Message } from "../entities/message.entity";

@Injectable()
export class MessagesAdminService {
    constructor(
        @InjectRepository(Message) private messageAdminRepository: Repository<Message>,
    ){}
          
    async findAll(query: PaginateQuery): Promise<Paginated<Message>> {
        const config: PaginateConfig<Message> = {
            relations: ['user'],
            sortableColumns: ['id'],
            defaultSortBy: [['createdAt', 'DESC']]
        }
        query.limit = query.limit == 0 ? 10 : query.limit;
        const result = await paginate<Message>(query, this.messageAdminRepository, config)
        return result;
    }
}