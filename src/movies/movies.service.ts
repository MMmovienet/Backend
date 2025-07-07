import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { throwCustomError } from 'src/common/helper';
import { FilterOperator, paginate, PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie) private movieRepository: Repository<Movie>
  ) {}

    async findAll(query: PaginateQuery): Promise<Paginated<Movie>> {
        const config: PaginateConfig<Movie> = {
            relations: ['genres'],
            sortableColumns: ['id', 'name'],
            maxLimit: 10,
            defaultSortBy: [['createdAt', 'DESC']],
            searchableColumns: ['name'],
        }
        if(query.filter && query.filter['genres.name']){
            config.filterableColumns =  {
                'genres.name': [FilterOperator.EQ],
            }
        }
        query.limit = query.limit == 0 ? 10 : query.limit;
        const result = await paginate<Movie>(query, this.movieRepository, config);
        return result;
    }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({where: {id}, relations: ['genres']});
    if(!movie) {
      throwCustomError("Movie not found.")
    }
    return movie;
  }

  async search(keyword: string) {
    const movies = await this.movieRepository
                          .createQueryBuilder('movie')
                          .select(['movie.id', 'movie.name', 'movie.main_poster', 'movie.release_date'])
                          .where("movie.name LIKE :name", {name: `%${keyword}%`})
                          .getMany();
    return movies;
  }
}
