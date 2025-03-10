import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Movie } from "../entities/movie.entity";
import { Repository } from "typeorm";
import { CreateMovieDto } from "../dto/requests/create-movie.dto";
import { UpdateMovieDto } from "../dto/requests/update-movie.dto";
import { throwCustomError, unlinkFile } from "src/common/helper";
import { paginate, PaginateConfig, Paginated, PaginateQuery } from "nestjs-paginate";
import { GenresAdminService } from "src/genres/admin/genres-admin.service";

@Injectable()
export class MoviesAdminService {
    constructor(
        @InjectRepository(Movie) private movieRepository: Repository<Movie>,
        private readonly genresService: GenresAdminService,
    ) {}

    async create(createMovieDto: CreateMovieDto, file: Express.Multer.File) {
        const genres = await Promise.all(
            createMovieDto.genres.map(async id => {
                const genre = await this.genresService.findOne(id);
                return genre;
            }),
        );
        const movieInstance = this.movieRepository.create({
            name: createMovieDto.name,
            description: createMovieDto.description,
            src: file.filename,
            genres: genres,
        });
        return this.movieRepository.save(movieInstance);
    }

    async update(id: number, updateMovieDto: UpdateMovieDto, file: Express.Multer.File) {
        const movie = await this.findOne(id);
        const genres = !updateMovieDto || !updateMovieDto.genres ? movie.genres : await Promise.all(
            updateMovieDto.genres.map(async id => {
                const genre = await this.genresService.findOne(id);
                return genre;
            }),
        );

        if(file) {
            await unlinkFile('movies', movie.src);
        }

        Object.assign(movie, {
            name: updateMovieDto && updateMovieDto.name ? updateMovieDto.name : movie.name,
            description: updateMovieDto && updateMovieDto.description ? updateMovieDto.description : movie.description,
            src: file && file.filename ? file.filename : movie.src ,
            genres: genres,
        });

        return this.movieRepository.save(movie);
    }
    
    async findAll(query: PaginateQuery): Promise<Paginated<Movie>> {
        const config: PaginateConfig<Movie> = {
            sortableColumns: ['id', 'name'],
            maxLimit: 10,
            defaultSortBy: [['createdAt', 'DESC']],
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
        return movie!;
    }
    
    async remove(id: number) {
        const movie = await this.findOne(id);
        await unlinkFile('movies', movie.src);
        await this.movieRepository.remove(movie);
        return movie;
    }
}