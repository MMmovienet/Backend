import { Injectable } from '@nestjs/common';
import { Serie } from './entities/serie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterOperator, paginate, PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { throwCustomError } from 'src/common/helper';
import { EpisodesAdminService } from 'src/episodes/admin/episodes-admin.service';

@Injectable()
export class SeriesService {
    constructor(
        @InjectRepository(Serie) private serieRepository: Repository<Serie>,
        private readonly episodesAdminService: EpisodesAdminService,
    ) {}
    
    async findAll(query: PaginateQuery): Promise<Paginated<Serie>> {
        const config: PaginateConfig<Serie> = {
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
        const result = await paginate<Serie>(query, this.serieRepository, config);
        return result;
    }

    async findOne(id: number) {
        const serie = await this.serieRepository.findOne({where: {id}, relations: ['genres', 'seasons', 'episodes']});
        if(!serie) {
            throwCustomError("Serie not found.")
        }
        return serie;
    }

    async findBySlug(slug: string) {
        const serie = await this.serieRepository.findOne({where: {slug}, relations: ['genres', 'seasons', 'episodes']});
        if(!serie) {
            throwCustomError("Serie not found.")
        }
        return serie;
    }

    async getEpisode(serie_slug: string, episode_slug: string) {
        return this.episodesAdminService.getExactEpisode(serie_slug, episode_slug);
    }

    async search(keyword: string) {
        const series = await this.serieRepository
                            .createQueryBuilder('serie')
                            .select(['serie.id', 'serie.name', 'serie.main_poster', 'serie.release_date'])
                            .where("serie.name LIKE :name", {name: `%${keyword}%`})
                            .getMany();
        return series;
    }
}
