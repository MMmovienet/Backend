import { Controller, Get,  Param } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Movie } from './entities/movie.entity';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Movie>> {
    return this.moviesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }
}
