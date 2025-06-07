import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from "@nestjs/common";
import { PostsAdminService } from "./posts-admin.service";
import { CreatePostDto } from "../dto/requests/create-post.dto";
import { UpdatePostDto } from "../dto/requests/update-post.dto";
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { Post as PostEntity } from "../entities/post.entity";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { PostDto } from "../dto/responses/post.dto";

@Controller('admins/posts')
@UseGuards(AdminGuard)
@Serialize(PostDto)
export class PostsAdminController {
    constructor(
        private readonly postsAdminService: PostsAdminService,
    ) {}

    @Post()
    create(@Body() createPostDto: CreatePostDto, @Request() req) {
        return this.postsAdminService.create(createPostDto, req.user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        return this.postsAdminService.update(+id, updatePostDto);
    }

    @Get('all')
    findAll(@Paginate() query: PaginateQuery): Promise<Paginated<PostEntity>> {
        return this.postsAdminService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsAdminService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.postsAdminService.remove(+id);
    }
}