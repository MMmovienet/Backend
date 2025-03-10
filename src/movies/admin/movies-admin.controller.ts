import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { MoviesAdminService } from "./movies-admin.service";
import { CreateMovieDto } from "../dto/requests/create-movie.dto";
import { UpdateMovieDto } from "../dto/requests/update-movie.dto";
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { Movie } from "../entities/movie.entity";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { MovieDto } from "../dto/responses/movie.dto";
import { existsSync, mkdirSync } from "fs";


@Controller('admins/movies')
@Serialize(MovieDto)
@UseGuards(AdminGuard)
export class MoviesAdminController {
    constructor(
        private moviesService: MoviesAdminService
    ) {}


    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'src', maxCount: 1 }, 
        { name: 'posters', maxCount: 8 }, 
    ], {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = file.fieldname === 'src' ? './uploads/movies' : './uploads/posters';
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
        @Body() createMovieDto: CreateMovieDto, 
        @UploadedFiles() files: { src: Express.Multer.File; posters: Express.Multer.File[] },
    ) {
        return this.moviesService.create(createMovieDto, files.src, files.posters);
    }

    @Patch(':id')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'src', maxCount: 1 }, 
        { name: 'posters', maxCount: 8 }, 
    ], {
        storage: diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'src') {
                    cb(null, './uploads/movies');
                } else if (file.fieldname === 'posters') {
                    cb(null, './uploads/posters');
                }
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
        @Body() updateMovieDto: UpdateMovieDto, 
        @UploadedFiles() files: { src: Express.Multer.File; posters: Express.Multer.File[] },
    ) {
        return this.moviesService.update(+id, updateMovieDto, files.src, files.posters);
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