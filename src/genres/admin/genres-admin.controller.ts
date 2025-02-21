import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateGenreDto } from "../dto/requests/create-genre.dto";
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { Genre } from "../entities/genre.entity";
import { UpdateGenreDto } from "../dto/requests/update-genre.dto";
import { GenresAdminService } from "./genres-admin.service";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { GenreDto } from "../dto/responses/genre.dto";

@Controller('admins/genres')
@Serialize(GenreDto)
@UseGuards(AdminGuard)
export class GenresAdminController {
    constructor(
        private genresAdminService: GenresAdminService,
    ){}
    
    @Post()
    create(@Body() createGenreDto: CreateGenreDto) {
        return this.genresAdminService.create(createGenreDto);
    }

    @Get('all')
    findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Genre>> {
        return this.genresAdminService.findAll(query);
    }
    
    
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.genresAdminService.findOne(+id);
    }
    
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
        return this.genresAdminService.update(+id, updateGenreDto);
    }
    
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.genresAdminService.remove(+id);
    }
}