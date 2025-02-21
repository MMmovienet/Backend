import { Controller, Get } from '@nestjs/common';
import { GenresService } from './genres.service';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Genre } from './entities/genre.entity';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { GenreDto } from './dto/responses/genre.dto';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  @Serialize(GenreDto)
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Genre>> {
    return this.genresService.findAll(query);
  }
}
