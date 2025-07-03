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

    async findAll(query: PaginateQuery): Promise<Paginated<Post>> {
        const queryBuilder = await this.postRepository
            .createQueryBuilder('post')
            .leftJoin('post.user', 'user') 
            .addSelect(['user.name', 'user.image']) 
            .leftJoin('post.movie', 'movie')
            .addSelect(['movie.id', 'movie.name', 'movie.main_poster']) 
            .leftJoin('post.serie', 'serie')
            .addSelect(['serie.id', 'serie.name', 'serie.main_poster']) 
            .loadRelationCountAndMap(
                'post.upvoteCount',
                'post.votes',
                'vote',
                qb => qb.andWhere('vote.type = :type', { type: 'UP' })
            )
            .loadRelationCountAndMap(
                'post.downvoteCount',
                'post.votes',
                'vote',
                qb => qb.andWhere('vote.type = :type', { type: 'DOWN' })
            )
        const config: PaginateConfig<Post> = {
            relations: ['movie', 'serie'],
            sortableColumns: ['id'],
            maxLimit: 10,
            defaultSortBy: [['createdAt', 'DESC']],
            searchableColumns: ['movie.name', 'serie.name']
        }
        query.limit = query.limit == 0 ? 10 : query.limit;
        const result = await paginate<Post>(query, queryBuilder, config);
        return result;
    }

    async findOne(id: number) {
        const post = await this.postRepository
            .createQueryBuilder('post')
            .where('post.id = :id', {id})
            .leftJoin('post.user', 'user') 
            .addSelect(['user.id', 'user.name', 'user.image']) 
            .leftJoin('post.movie', 'movie')
            .addSelect(['movie.id', 'movie.name', 'movie.main_poster']) 
            .leftJoin('post.serie', 'serie')
            .addSelect(['serie.id', 'serie.name', 'serie.main_poster']) 
            .loadRelationCountAndMap(
                'post.upvoteCount',
                'post.votes',
                'vote',
                qb => qb.andWhere('vote.type = :type', { type: 'UP' })
            )
            .loadRelationCountAndMap(
                'post.downvoteCount',
                'post.votes',
                'vote',
                qb => qb.andWhere('vote.type = :type', { type: 'DOWN' })
            ).getOne()
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