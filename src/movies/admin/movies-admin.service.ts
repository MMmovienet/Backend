import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Movie } from "../entities/movie.entity";
import { Repository } from "typeorm";
import { CreateMovieDto } from "../dto/requests/create-movie.dto";
import { UpdateMovieDto } from "../dto/requests/update-movie.dto";
import { throwCustomError, unlinkFile } from "src/common/helper";
import { paginate, PaginateConfig, Paginated, PaginateQuery } from "nestjs-paginate";
import { GenresAdminService } from "src/genres/admin/genres-admin.service";
import { Poster } from "../entities/poster.entity";

@Injectable()
export class MoviesAdminService {
    constructor(
        @InjectRepository(Movie) private movieRepository: Repository<Movie>,
        @InjectRepository(Poster) private readonly posterRepository: Repository<Poster>,
        private readonly genresService: GenresAdminService,
    ) {}

    async create(
        createMovieDto: CreateMovieDto, 
        video: Express.Multer.File, 
        posters: Express.Multer.File[],
    ) {
        const genres = await Promise.all(
            createMovieDto.genres.map(async id => {
                const genre = await this.genresService.findOne(id);
                return genre;
            }),
        );
        const movieInstance = this.movieRepository.create({
            name: createMovieDto.name,
            description: createMovieDto.description,
            src: video[0].filename,
            genres: genres,
        });
        const savedMovie = await this.movieRepository.save(movieInstance);
        if(posters.length > 0) {
            await this.savePosters(posters, savedMovie);
        }
        return savedMovie;
    }

    async update(
        id: number, 
        updateMovieDto: UpdateMovieDto, 
        video: Express.Multer.File, 
        posters: Express.Multer.File[],
    ) {
        const movie = await this.findOne(id);
        if(posters && posters.length > 0) {
            await this.removePosters(movie.posters);
        }
        const genres = !updateMovieDto || !updateMovieDto.genres ? movie.genres : await Promise.all(
            updateMovieDto.genres.map(async id => {
                const genre = await this.genresService.findOne(id);
                return genre;
            }),
        );
        if(video) {
            await unlinkFile('movies', movie.src);
        }

        Object.assign(movie, {
            name: updateMovieDto && updateMovieDto.name ? updateMovieDto.name : movie.name,
            description: updateMovieDto && updateMovieDto.description ? updateMovieDto.description : movie.description,
            src: video && video[0].filename ? video[0].filename : movie.src ,
            genres: genres,
        });
        const updatedPoster = this.movieRepository.save(movie);
        if(posters && posters.length > 0) {
            await this.savePosters(posters, movie);
        }
        return updatedPoster;
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
        const movie = await this.movieRepository.findOne({where: {id}, relations: ['genres', 'posters']});
        if(!movie) {
            throwCustomError("Movie not found.")
        }
        return movie!;
    }
    
    async remove(id: number) {
        const movie = await this.findOne(id);
        await unlinkFile('movies', movie.src);
        await movie.posters.map(async (poster) => {
            await unlinkFile('posters', poster.src as string);
        })
        await this.movieRepository.remove(movie);
        return movie;
    }

    async savePosters(files: Express.Multer.File[], movie: Movie) {
        const posters = files.map(file => {
            const poster = new Poster({
                src: file.filename,
                movie: movie,
            });
            return this.posterRepository.save(poster);
        })
        await Promise.all(posters);
    }

    async removePosters(posters: Poster[]) {
        posters.map(async (poster) => {
            await unlinkFile('posters', poster.src as string);
            const result = await this.posterRepository.findOne({where: {id: poster.id}});
            await this.posterRepository.remove(result!);
        });
    }
}