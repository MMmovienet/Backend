import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/requests/create-post.dto';
import { UpdatePostDto } from './dto/requests/update-post.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Post as PostEntity } from './entities/post.entity';
import { UserGuard } from 'src/common/guards/user.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PostDto } from './dto/responses/post.dto';
import { VotePostDto } from './dto/requests/vote-post.dto';
import { VoteDto } from './dto/responses/vote.dto';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
    ) {}
    
    @Get()
    @Serialize(PostDto) 
    async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<PostEntity>> {
        return this.postsService.findAll(query);
    }

    @Get(':id')
    @Serialize(PostDto) 
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(+id);
    }

    @Post()
    @Serialize(PostDto) 
    @UseGuards(UserGuard)
    create(@Body() createPostDto: CreatePostDto, @Request() req) {
        return this.postsService.create(createPostDto, req.user);
    }

    @Patch(':id')
    @Serialize(PostDto) 
    @UseGuards(UserGuard)
    update(@Param('id') id: string, @Request() req, @Body() updatePostDto: UpdatePostDto) {
        return this.postsService.update(+id, req.user, updatePostDto);
    }

    @Delete(':id')
    @Serialize(PostDto) 
    @UseGuards(UserGuard)
    remove(@Param('id') id: string, @Request() req) {
        return this.postsService.remove(+id, req.user);
    }

    @Post(':id/vote')
    @UseGuards(UserGuard)
    @Serialize(VoteDto) 
    vote(@Param('id') id: string, @Request() req, @Body() votePostDto: VotePostDto) {
        return this.postsService.vote(+id, req.user, votePostDto);
    }
}
