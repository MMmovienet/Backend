import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "../entities/post.entity";
import { Repository } from "typeorm";
import { Vote } from "../entities/vote.entity";
import { CreatePostDto } from './../dto/requests/create-post.dto';
import { UpdatePostDto } from './../dto/requests/update-post.dto';
import { paginate, PaginateConfig, Paginated, PaginateQuery } from "nestjs-paginate";
import { User } from "src/users/entities/user.entity";
import { MoviesAdminService } from "src/movies/admin/movies-admin.service";
import { SeriesAdminService } from "src/series/admin/series-admin.service";
import { throwCustomError } from "src/common/helper";

@Injectable()
export class PostsAdminService {
    constructor(
        @InjectRepository(Post) private postRepository: Repository<Post>,
        @InjectRepository(Vote) private voteRepository: Repository<Vote>,
        private readonly moviesAdminService: MoviesAdminService,
        private readonly seriesAdminService: SeriesAdminService,
    ){}

    async create(createPostDto: CreatePostDto, user: User) {
        let movie;
        let serie;
        if(createPostDto.movieId) {
            movie = await this.moviesAdminService.findOne(createPostDto.movieId);
        }
        if(createPostDto.serieId) {
            serie = await this.seriesAdminService.findOne(createPostDto.serieId);
        }
        if(!createPostDto.movieId && !createPostDto.serieId) {
            throwCustomError("Please select movie or serie")
        }
        const postInstance = this.postRepository.create({
            text: createPostDto.text,
            user: user,
            movie: movie,
            serie: serie,
        });
        return this.postRepository.save(postInstance);
    }

    async update(id: number, updatePostDto: UpdatePostDto) {
        const post = await this.findOne(id); 
        const isValidId = updatePostDto.movieId || updatePostDto.serieId;
        let movie = isValidId ? null: post.movie;
        let serie = isValidId ? null: post.serie;
        if(updatePostDto.movieId) {
            movie = await this.moviesAdminService.findOne(updatePostDto.movieId);
        }
        if(updatePostDto.serieId) {
            serie = await this.seriesAdminService.findOne(updatePostDto.serieId);
        }
        Object.assign(post, {
            text: updatePostDto.text ? updatePostDto.text : post.text,
            movie: movie,
            serie: serie,
        });
        return this.postRepository.save(post);
    }

    async findAll(query: PaginateQuery): Promise<Paginated<Post>> {
        const config: PaginateConfig<Post> = {
            sortableColumns: ['id'],
            maxLimit: 10,
            defaultSortBy: [['createdAt', 'DESC']],
        }
        query.limit = query.limit == 0 ? 10 : query.limit;
        const result = await paginate<Post>(query, this.postRepository, config);
        return result;
    }

    async findOne(id: number) {
        const post = await this.postRepository.findOne({where: {id}, relations: ['user', 'movie', 'serie']});
        if(!post) {
            throwCustomError("Post not found.")
        }
        return post!;
    }

    async remove(id: number) {
        const post = await this.findOne(id);
        await this.postRepository.remove(post);
        return post; 
    }
}