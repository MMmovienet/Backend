import { paginate, PaginateConfig, Paginated, PaginateQuery } from "nestjs-paginate";
import { Genre } from "../entities/genre.entity";
import { CreateGenreDto } from "../dto/requests/create-genre.dto";
import { UpdateGenreDto } from "../dto/requests/update-genre.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { throwCustomError } from "src/common/helper";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GenresAdminService {
    constructor(
        @InjectRepository(Genre) private genreAdminRepository: Repository<Genre>,
    ){}
          
    async create(createGenreDto: CreateGenreDto) {
        const genreInstance = this.genreAdminRepository.create({
            name: createGenreDto.name,
        });
        return this.genreAdminRepository.save(genreInstance);
    }

    async findAll(query: PaginateQuery): Promise<Paginated<Genre>> {
        const config: PaginateConfig<Genre> = {
          sortableColumns: ['id', 'name'],
          maxLimit: 10,
          defaultSortBy: [['createdAt', 'DESC']]
        }
        query.limit = query.limit == 0 ? 10 : query.limit;
        const result = await paginate<Genre>(query, this.genreAdminRepository, config)
        return result;
    }
    
    async findOne(id: number) {
        const genre = await this.genreAdminRepository.findOne({where: {id}}); 
        if(!genre) {
            throwCustomError('Genre not found.');
        }
        return genre!;
    }
    
    async update(id: number, updateGenreDto: UpdateGenreDto) {
        const gnere: Genre = await this.findOne(id);
        const existedGenre = await this.genreAdminRepository.findOne({where: {name: updateGenreDto.name, id: Not(id)}});
        if(existedGenre) {
            throwCustomError('This genre type has already exist.');
        }

        Object.assign(gnere, {
            name: updateGenreDto.name,
        });
    
        return this.genreAdminRepository.save(gnere);
    }
    
    async remove(id: number) {
        const genre = await this.findOne(id);
        await this.genreAdminRepository.remove(genre);
        return genre;
    }
}