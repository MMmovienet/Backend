import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Serie } from "../../series/entities/serie.entity";
import { throwCustomError } from "src/common/helper";
import { Season } from "../entities/season.entity";
import { CreateSeasonDto } from "../dto/requests/create-season.dto";
import { UpdateSeasonDto } from "../dto/requests/update-season.dto";

@Injectable()
export class SeasonsAdminService {
    constructor(
        @InjectRepository(Season) private seasonRepository: Repository<Season>,
    ){}

    async findOne(id: number): Promise<Season> {
        const season = await this.seasonRepository.findOne({where: {id}, relations: ["serie"]});
        if(!season) {
            throwCustomError("Season not found.")
        }
        return season!;
    }

    async getSeasonOfSerie(season_id: number, serie_id: number): Promise<Season> {
        const season = await this.seasonRepository.findOne({where: {id: season_id, serie: {id: serie_id} }})
        if(!season) {
            throwCustomError("Season is not already added.")
        }
        return season!;
    }

    async create(serie: Serie, createSeasonDto: CreateSeasonDto) {
        const season = await this.seasonRepository.findOne({where: {number: createSeasonDto.number, serie: {id: serie.id}}})
        if(season) {
            throwCustomError("Season number is already added.")
        }
        const seasonInstance = this.seasonRepository.create({
            number: createSeasonDto.number,
            name: createSeasonDto.name,
            description: createSeasonDto.description,
            release_date: createSeasonDto.release_date,
            serie: serie,
        });
        return this.seasonRepository.save(seasonInstance);
    }

    async update(id: number, updateSeasonDto: UpdateSeasonDto) {
        const season = await this.findOne(id);
        if(updateSeasonDto && updateSeasonDto.number) {
            const existedSeason = await this.seasonRepository.findOne({where: {number: updateSeasonDto.number, serie: {id: season.serie.id}, id: Not(id)}});
            if(existedSeason) {
                throwCustomError('Season number already exists in this serie.')
            }
        }
        Object.assign(season, {
            number: updateSeasonDto && updateSeasonDto.number ? updateSeasonDto.number : season.number,
            name: updateSeasonDto && updateSeasonDto.name ? updateSeasonDto.name : season.name,
            description: updateSeasonDto && updateSeasonDto.description ? updateSeasonDto.description : season.description,
            release_date: updateSeasonDto && updateSeasonDto.release_date ? updateSeasonDto.release_date : season.release_date,
        })
        const updatedSeason = await this.seasonRepository.save(season);
        return updatedSeason;
    }

    async delete(id: number) {
        const season = await this.findOne(id);
        await this.seasonRepository.remove(season);
        return season;  
    }
}