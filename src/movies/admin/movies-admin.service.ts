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

    async create(
        createMovieDto: CreateMovieDto, 
        video: Express.Multer.File, 
        main_poster: Express.Multer.File, 
        cover_poster: Express.Multer.File,
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
            release_date: createMovieDto.release_date,
            main_poster: main_poster[0].filename,
            cover_poster: cover_poster && cover_poster[0].filename,
            genres: genres,
        });
        const savedMovie = await this.movieRepository.save(movieInstance);
        return savedMovie;
    }

    async update(
        id: number, 
        updateMovieDto: UpdateMovieDto, 
        video: Express.Multer.File, 
        main_poster: Express.Multer.File | null, 
        cover_poster: Express.Multer.File | null,
    ) {
        const movie = await this.findOne(id);
        const genres = !updateMovieDto || !updateMovieDto.genres ? movie.genres : await Promise.all(
            updateMovieDto.genres.map(async id => {
                const genre = await this.genresService.findOne(id);
                return genre;
            }),
        );
        if(video) await unlinkFile('movies', movie.src);
        if(main_poster) await unlinkFile('posters', movie.main_poster);
        if(cover_poster && movie.cover_poster) await unlinkFile('posters', movie.cover_poster);

        Object.assign(movie, {
            name: updateMovieDto && updateMovieDto.name ? updateMovieDto.name : movie.name,
            description: updateMovieDto && updateMovieDto.description ? updateMovieDto.description : movie.description,
            release_date: updateMovieDto.release_date ? updateMovieDto.release_date : movie.release_date,
            src: video && video[0].filename ? video[0].filename : movie.src,
            main_poster: main_poster ? main_poster[0].filename : movie.main_poster,
            cover_poster: cover_poster ? cover_poster[0].filename : movie.cover_poster,
            genres: genres,
        });
        const updatedMovie = this.movieRepository.save(movie);
        return updatedMovie;
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
        await unlinkFile('posters', movie.main_poster);
        if(movie.cover_poster) await unlinkFile('posters', movie.cover_poster);
        await this.movieRepository.remove(movie);
        return movie;
    }
}