import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { SeasonDto } from "../dto/responses/season.dto";
import { SeasonsAdminService } from "./seasons-admin.service";
import { UpdateSeasonDto } from "../dto/requests/update-season.dto";

@Controller("admins/seasons")
@UseGuards(AdminGuard)
export class SeasonsAdminController {
    constructor(
        private seasonsAdminService: SeasonsAdminService
    ){}

    @Patch(':id')
    @Serialize(SeasonDto, "Season updated successfully.")
    update(@Param('id') id: string, @Body() updateSeasonDto: UpdateSeasonDto) {
        return this.seasonsAdminService.update(+id, updateSeasonDto);
    }

    @Delete(':id')
    @Serialize(SeasonDto, "Season deleted successfully.")
    delete(@Param('id') id: string) {
        return this.seasonsAdminService.delete(+id);
    }
}