import { Injectable } from '@nestjs/common';
import { throwCustomError } from 'src/common/helper';
import { paginate, PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { User } from 'src/users/entities/user.entity';
import { MoviesAdminService } from 'src/movies/admin/movies-admin.service';
import { SeriesAdminService } from 'src/series/admin/series-admin.service';
import { CreatePostDto } from './dto/requests/create-post.dto';
import { UpdatePostDto } from './dto/requests/update-post.dto';
import { VotePostDto } from './dto/requests/vote-post.dto';
import { VoteRealtimeGateway } from 'src/common/realtime/vote-realtime.gateway';
import { VoteType } from 'src/common/enums/VoteType';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post) private postRepository: Repository<Post>,
        @InjectRepository(Vote) private voteRepository: Repository<Vote>,
        private readonly moviesAdminService: MoviesAdminService,
        private readonly seriesAdminService: SeriesAdminService,
        private readonly voteRealtimeGateway: VoteRealtimeGateway,
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
            throwCustomError("Please select movie or serie.")
        }
        const postInstance = this.postRepository.create({
            text: createPostDto.text,
            user: user,
            movie: movie,
            serie: serie,
        });
        return this.postRepository.save(postInstance);
    }

    async update(id: number, user: User, updatePostDto: UpdatePostDto) {
        const post = await this.postRepository.findOne({where: {id: id, user: {id: user.id}}}); 
        if(!post) {
            throwCustomError("Post not found.")
        }
        const isValidId = updatePostDto.movieId || updatePostDto.serieId;
        let movie = isValidId ? null: post!.movie;
        let serie = isValidId ? null: post!.serie;
        if(updatePostDto.movieId) {
            movie = await this.moviesAdminService.findOne(updatePostDto.movieId);
        }
        if(updatePostDto.serieId) {
            serie = await this.seriesAdminService.findOne(updatePostDto.serieId);
        }
        Object.assign(post!, {
            text: updatePostDto.text ? updatePostDto.text : post!.text,
            movie: movie,
            serie: serie,
        });
        return this.postRepository.save(post!);
    }

    async findAll(query: PaginateQuery, userId?: number): Promise<Paginated<Post>> {
        const queryBuilder = await this.postRepository
            .createQueryBuilder('post')
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
            )
        if(userId) queryBuilder.where('user.id = :id', {id: userId})
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

    async remove(id: number, user: User) {
        const post = await this.findOne(id)
        if(!post || post.user.id !== user.id) {
            throwCustomError("Post not found.")
        }
        await this.postRepository.remove(post!);
        return {...post, id: id}; 
    }

    async vote(id: number, user: User, votePostDto: VotePostDto) {
        let vote = await this.voteRepository.findOne({where: {post: {id: id}, user: {id: user.id}}});
        if(vote) {
            await this.voteRepository.remove(vote);
            this.emitVote(id, vote.type as VoteType, false);
            if(votePostDto.type !== vote.type) {
                vote = await this.createVote(id, votePostDto.type as VoteType, user);
                this.emitVote(id, votePostDto.type as VoteType, true);
            }
        } else {
            vote = await this.createVote(id, votePostDto.type as VoteType, user);
            this.emitVote(id, votePostDto.type as VoteType, true);
        }
        return vote;
    }

    async createVote(postId: number, voteType: VoteType, user) {
        const post = await this.findOne(postId);
        const voteInstance = this.voteRepository.create({
            type: voteType,
            post: post,
            user: user,
        });
        return this.voteRepository.save(voteInstance)
    }

    emitVote(postId: number, type: VoteType, isAdd: boolean) {
        this.voteRealtimeGateway.emitToAll('vote', {
            postId,
            type,
            isAdd,
        });
    }
}
