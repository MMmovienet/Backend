import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { MessageDto } from "../dto/responses/message.dto";
import { Message } from "../entities/message.entity";
import { MessagesAdminService } from "./messages-admin.service";

@Controller('admins/messages')
@Serialize(MessageDto)
@UseGuards(AdminGuard)
export class MessagesAdminController {
    constructor(
        private messagesAdminService: MessagesAdminService,
    ){}

    @Get('all')
    findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Message>> {
        return this.messagesAdminService.findAll(query);
    }
}