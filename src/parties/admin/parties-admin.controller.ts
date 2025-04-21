import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { PartiesAdminService } from "./parties-admin.service";
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { Party } from "../entities/party.entity";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { PartyDto } from "../dto/responses/party.dto";
import { AdminGuard } from "src/common/guards/admin.guard";

@Controller('admins/parties')
@Serialize(PartyDto)
@UseGuards(AdminGuard)
export class PartiesAdminController {
    constructor(
        private readonly partiesAdminService: PartiesAdminService,
    ){}

    @Get('all')
    findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Party>> {
        return this.partiesAdminService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.partiesAdminService.findOne(+id);
    }
}