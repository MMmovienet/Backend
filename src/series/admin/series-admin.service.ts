import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Serie } from "../entities/serie.entity";
import { Repository } from "typeorm";
import { paginate, PaginateConfig, Paginated, PaginateQuery } from "nestjs-paginate";
import { throwCustomError, unlinkFile } from "src/common/helper";
import { CreateSerieDto } from "../dto/requests/create-serie.dto";
import { GenresAdminService } from "src/genres/admin/genres-admin.service";
import { UpdateSerieDto } from "../dto/requests/update-serie.dto";
import { SeasonsAdminService } from '../../seasons/admin/seasons-admin.service';
import { EpisodesAdminService } from "../../episodes/admin/episodes-admin.service";
import { CreateSeasonDto } from "src/seasons/dto/requests/create-season.dto";
import { CreateEpisodeDto } from "src/episodes/dto/requests/create-episode.dto";

@Injectable()
export class SeriesAdminService {
    constructor(
        @InjectRepository(Serie) private serieRepository: Repository<Serie>,
        private readonly genresService: GenresAdminService,
        private readonly seasonsAdminService: SeasonsAdminService,
        private readonly episodesAdminService: EpisodesAdminService,
    ){}

    async findAll(query: PaginateQuery): Promise<Paginated<Serie>> {
        const config: PaginateConfig<Serie> = {
            sortableColumns: ['id', 'name'],
            maxLimit: 10,
            defaultSortBy: [['createdAt', 'DESC']],
        }
        query.limit = query.limit == 0 ? 10 : query.limit;
        const result = await paginate<Serie>(query, this.serieRepository, config);
        return result;
    }

    async findOne(id: number): Promise<Serie> {
        const serie = await this.serieRepository.findOne({
            where: {id}, relations: ['genres', 'seasons', 'episodes'], 
            order: {
                seasons: {
                    number: 'ASC'
                },
                episodes: {
                    number: 'ASC',
                },
            },
        });
        if(!serie) {
            throwCustomError("Serie not found.")
        }
        return serie!;
    }

    async create(
        createSerieDto: CreateSerieDto, 
        main_poster: Express.Multer.File, 
        cover_poster: Express.Multer.File,
    ) {
        const genres = await Promise.all(
            createSerieDto.genres.map(async id => {
                const genre = await this.genresService.findOne(id);
                return genre;
            }),
        );
        const serieInstance = this.serieRepository.create({
            name: createSerieDto.name,
            description: createSerieDto.description,
            release_date: createSerieDto.release_date,
            main_poster: main_poster[0].filename,
            cover_poster: cover_poster && cover_poster[0].filename,
            genres: genres,
        });
        const savedSerie = await this.serieRepository.save(serieInstance);
        return savedSerie;
    }

    async update(
        id: number, 
        updateSerieDto: UpdateSerieDto, 
        main_poster: Express.Multer.File | null, 
        cover_poster: Express.Multer.File | null,
    ) {
        const serie = await this.findOne(id);
        const genres = !updateSerieDto || !updateSerieDto.genres ? serie.genres : await Promise.all(
            updateSerieDto.genres.map(async id => {
                const genre = await this.genresService.findOne(id);
                return genre;
            }),
        );  
        if(main_poster) await unlinkFile('series/posters', serie.main_poster);
        if(cover_poster && serie.cover_poster) await unlinkFile('series/posters', serie.cover_poster);

        Object.assign(serie, {
            name: updateSerieDto && updateSerieDto.name ? updateSerieDto.name : serie.name,
            description: updateSerieDto && updateSerieDto.description ? updateSerieDto.description : serie.description,
            release_date: updateSerieDto.release_date ? updateSerieDto.release_date : serie.release_date,
            main_poster: main_poster ? main_poster[0].filename : serie.main_poster,
            cover_poster: cover_poster ? cover_poster[0].filename : serie.cover_poster,
            genres: genres,
        });
        const updatedSerie = await this.serieRepository.save(serie);
        return updatedSerie;
    }
      
    async remove(id: number) {
        const serie = await this.findOne(id);

        await unlinkFile('series/posters', serie.main_poster);
        if(serie.cover_poster) await unlinkFile('series/posters', serie.cover_poster);
        await Promise.all(serie.episodes.map( async (episode) => {
            await unlinkFile('series/episodes', episode.src);
        }))

        await this.serieRepository.remove(serie);
        return serie;
    }

    async createSeason(id: number, createSeasonDto: CreateSeasonDto) {
        const serie = await this.findOne(id)
        const season = await this.seasonsAdminService.create(serie, createSeasonDto);
        return season;
    }

    async createEpisode(id: number, createEpisodeDto: CreateEpisodeDto, file: Express.Multer.File) {
        const serie = await this.findOne(id)
        const episode = await this.episodesAdminService.create(serie, createEpisodeDto, file);
        return episode;
    }
}