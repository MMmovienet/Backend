import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { MoviesAdminService } from "./movies-admin.service";
import { CreateMovieDto } from "../dto/requests/create-movie.dto";
import { UpdateMovieDto } from "../dto/requests/update-movie.dto";
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { Movie } from "../entities/movie.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { MovieDto } from "../dto/responses/movie.dto";


@Controller('admins/movies')
@Serialize(MovieDto)
@UseGuards(AdminGuard)
export class MoviesAdminController {
    constructor(
        private moviesService: MoviesAdminService
    ) {}


    @Post()
    @UseInterceptors(
        FileInterceptor('src', {
            storage: diskStorage({
                destination: './uploads/movies',
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
    create(@Body() createMovieDto: CreateMovieDto, @UploadedFile() file: Express.Multer.File) {
        return this.moviesService.create(createMovieDto, file);
    }

    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('src', {
            storage: diskStorage({
                destination: './uploads/movies',
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
    update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto, @UploadedFile() file: Express.Multer.File) {
        return this.moviesService.update(+id, updateMovieDto, file);
    }

    @Get('all')
    findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Movie>> {
        return this.moviesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.moviesService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.moviesService.remove(+id);
    }
}