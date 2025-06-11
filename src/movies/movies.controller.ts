import { Controller, Get,  Param, Req, Res } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Movie } from './entities/movie.entity';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { MovieDto } from './dto/responses/movie.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Response, Request } from 'express';
import { throwCustomError } from 'src/common/helper';

@Controller('movies')
@Serialize(MovieDto)
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Get(':filename/watch')
    async streamVideo(
        @Param('filename') filename: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const filePath = path.join(__dirname, '..', '..', 'uploads', 'movies', filename);
        if (!fs.existsSync(filePath)) {
            throwCustomError('Movie not found!')
        }
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (!range) {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            });
            fs.createReadStream(filePath).pipe(res);
            return;
        }
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
        const contentLength = end - start + 1;
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4',
        });
        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
    }

    @Get()
    findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Movie>> {
        return this.moviesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.moviesService.findOne(+id);
    }

    @Get('/search/:keyword')
    search(@Param('keyword') keyword: string) {
        return this.moviesService.search(keyword);
    }
}
