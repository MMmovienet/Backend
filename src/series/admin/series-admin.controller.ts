import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { SeriesAdminService } from "./series-admin.service";
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { Serie } from "../entities/serie.entity";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { existsSync, mkdirSync } from "fs";
import { extname } from "path";
import { CreateSerieDto } from "../dto/requests/create-serie.dto";
import { UpdateSerieDto } from "../dto/requests/update-serie.dto";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { SerieDto } from "../dto/responses/serie.dto";
import { SeasonDto } from "../../seasons/dto/responses/season.dto";
import { EpisodeDto } from "../../episodes/dto/responses/episode.dto";
import { CreateSeasonDto } from "src/seasons/dto/requests/create-season.dto";
import { CreateEpisodeDto } from "src/episodes/dto/requests/create-episode.dto";

@Controller("admins/series")
@UseGuards(AdminGuard)
export class SeriesAdminController {
    constructor(
        private seriesAdminService: SeriesAdminService
    ){}

    @Get('all')
    @Serialize(SerieDto)
    findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Serie>> {
        return this.seriesAdminService.findAll(query);
    }

    @Get(':id')
    @Serialize(SerieDto)
    findOne(@Param('id') id: string) {
        return this.seriesAdminService.findOne(+id);
    }

    @Post()
    @Serialize(SerieDto, "Serie created successfully.")
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'main_poster', maxCount: 1 }, 
        { name: 'cover_poster', maxCount: 1 }, 
    ], {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = './uploads/posters';
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    create(
        @Body() createSerieDto: CreateSerieDto, 
        @UploadedFiles() files: { main_poster: Express.Multer.File; cover_poster: Express.Multer.File },
    ) {
        return this.seriesAdminService.create(createSerieDto, files.main_poster, files.cover_poster);
    }   

    @Patch(':id')
    @Serialize(SerieDto, "Serie updated successfully.")
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'main_poster', maxCount: 1 }, 
        { name: 'cover_poster', maxCount: 1 }, 
    ], {
        storage: diskStorage({
            destination: (req, file, cb) => {
                cb(null, './uploads/posters');
            },
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    update(
        @Param('id') id: string, 
        @Body() updateSerieDto: UpdateSerieDto, 
        @UploadedFiles() files: { main_poster: Express.Multer.File; cover_poster: Express.Multer.File },
    ) {
        const main_poster = files?.main_poster || null;
        const cover_poster = files?.cover_poster || null;
        return this.seriesAdminService.update(+id, updateSerieDto, main_poster, cover_poster);
    } 


    @Delete(':id')
    @Serialize(SerieDto, "Serie deleted successfully.")
    remove(@Param('id') id: string) {
        return this.seriesAdminService.remove(+id);
    }

    @Post(':id/seasons')
    @Serialize(SeasonDto, "Season created successfully.")
    createSeason(@Param('id') id: string, @Body() createSeasonDto: CreateSeasonDto) {
        return this.seriesAdminService.createSeason(+id, createSeasonDto)
    }

    @Post(':id/episodes')
    @Serialize(EpisodeDto, "Episode created successfully.")
    @UseInterceptors(
        FileInterceptor('src', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    cb(null, './uploads/movies');
                },
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    createEpisode(@Param('id') id: string, @Body() createEpisodeDto: CreateEpisodeDto, @UploadedFile() file: Express.Multer.File) {
        return this.seriesAdminService.createEpisode(+id, createEpisodeDto, file);
    }
}