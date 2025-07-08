import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Repository } from 'typeorm';
import { paginate, PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre) private genreRepository: Repository<Genre>,
  ){}

  async findAll(query: PaginateQuery): Promise<Paginated<Genre>> {
    const config: PaginateConfig<Genre> = {
      sortableColumns: ['id', 'name'],
      defaultSortBy: [['createdAt', 'DESC']]
    }
    query.limit = query.limit == 0 ? 100 : query.limit;
    const result = await paginate<Genre>(query, this.genreRepository, config)
    return result;
  }
}
