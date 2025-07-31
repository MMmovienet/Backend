import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Serie } from "../../series/entities/serie.entity";
import { throwCustomError, unlinkFile } from "src/common/helper";
import { SeasonsAdminService } from "../../seasons/admin/seasons-admin.service";
import { Episode } from "../entities/episode.entity";
import { CreateEpisodeDto } from "../dto/requests/create-episode.dto";
import { UpdateEpisodeDto } from "../dto/requests/update-episode.dto";

@Injectable()
export class EpisodesAdminService {
    constructor(
        @InjectRepository(Episode) private episodeRepository: Repository<Episode>,
        private readonly seasonsAdminService: SeasonsAdminService,
    ){}

    async findOne(id: number): Promise<Episode> {
        const episode = await this.episodeRepository.findOne({where: {id}, relations: ['serie', 'season']});
        if(!episode) {
            throwCustomError("Episode is not found.")
        }
        return episode!;
    }

    async getExactEpisode(serie_slug: string, episode_slug: string): Promise<Episode> {
        const episode = await this.episodeRepository.findOne({where: {slug: episode_slug, serie: {slug: serie_slug}}, relations: ['serie', 'season']});
        if(!episode) {
            throwCustomError("Episode not found!")
        }
        return episode!;
    }

    async create(serie: Serie, createEpisodeDto: CreateEpisodeDto, file: Express.Multer.File) {
        let episode: Episode | null;

        if (createEpisodeDto.seasonId) {
            episode = await this.episodeRepository.findOne({
                where: {
                    serie: {id: serie.id},
                    number: createEpisodeDto.number,
                    season: { id: createEpisodeDto.seasonId },
                },
            });
        } else {
            episode = await this.episodeRepository.findOne({
                where: {
                    serie: {id: serie.id},
                    number: createEpisodeDto.number,
                    season: IsNull(),
                },
            });
        }
        
        if(episode) {
            throwCustomError("The episode with this number is already added.")
        }
        let season;
        if(createEpisodeDto.seasonId) {
            season = await this.seasonsAdminService.getSeasonOfSerie(createEpisodeDto.seasonId, serie.id);
        }
        const episodeInstance = this.episodeRepository.create({
            number: createEpisodeDto.number,
            name: createEpisodeDto.name,
            slug: createEpisodeDto.slug,
            description: createEpisodeDto.description,
            serie: serie,
            src: file.filename,
            season: season,
        });
        return this.episodeRepository.save(episodeInstance);
    }

    async update(id: number, updateEpisodeDto: UpdateEpisodeDto, file: Express.Multer.File) {
        let episode = await this.findOne(id);
        if (updateEpisodeDto?.number || updateEpisodeDto?.seasonId) {
            const existedEpisode = await this.episodeRepository.findOne({
                where: {
                    serie: {id: episode.serie.id},
                    number: updateEpisodeDto.number ? updateEpisodeDto.number : episode.number,
                    season: updateEpisodeDto.seasonId || episode.season ? { id: updateEpisodeDto.seasonId ? updateEpisodeDto.seasonId : episode.season.id } : IsNull(),
                    id: Not(id), 
                },
            });
            console.log(existedEpisode) 
            if (existedEpisode) {
                throwCustomError("Episode number already exists in this serie.");
            }
        }
        let filename = episode.src;
        if(file) filename = file.filename;
        let season = episode.season;
        if(updateEpisodeDto && updateEpisodeDto.seasonId) 
            season = await this.seasonsAdminService.getSeasonOfSerie(updateEpisodeDto.seasonId, episode.serie.id);

        const existedEpisodeBySlug = await this.episodeRepository.findOne({where: {slug: updateEpisodeDto.slug, id: Not(id)}});
        if(existedEpisodeBySlug) {
            throwCustomError('Episode with this slug already exists.');
        }
        Object.assign(episode, {
            number: updateEpisodeDto && updateEpisodeDto.number ? updateEpisodeDto.number: episode.number,
            name: updateEpisodeDto && updateEpisodeDto.name ? updateEpisodeDto.name: episode.name,
            slug: updateEpisodeDto && updateEpisodeDto.slug ? updateEpisodeDto.slug: episode.slug,
            description: updateEpisodeDto ? updateEpisodeDto.description : episode.description,
            src: filename,
            season: season,
        })

        return this.episodeRepository.save(episode);
    }

    async delete(id: number) {
        const episode = await this.findOne(id);
        await unlinkFile("series/episodes", episode.src);
        await this.episodeRepository.remove(episode);
        return episode;
    }
}