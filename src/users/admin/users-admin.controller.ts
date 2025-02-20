import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "../dto/requests/create-user.dto";
import { UsersAdminService } from "./users-admin.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { UpdateUserDto } from "../dto/requests/update-user.dto";
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { User } from "../entities/user.entity";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { UserDto } from "../dto/responses/user.dto";

@Controller('admins/users')
@UseGuards(AdminGuard)
export class UsersAdminController {
    constructor(
        private usersAdminService: UsersAdminService
    ){}

    @Get('/all')
    @Serialize(UserDto)
    findAll(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
        return this.usersAdminService.findAll(query);
    }
  
    @Get(':id')
    @Serialize(UserDto)
    findOne(@Param('id') id: string) {
        return this.usersAdminService.findOne(+id);
    }

    @Post()
    @UseInterceptors(
        FileInterceptor('image', {
          storage: diskStorage({
            destination: './uploads/users',
            filename: (req, file, cb) => {
              const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
              cb(null, `${randomName}${extname(file.originalname)}`);
            },
          }),
        }),
    )
    @Serialize(UserDto, 'User created successfully.')
    create(@Body() createUserDto: CreateUserDto, @UploadedFile() file: Express.Multer.File) {
        return this.usersAdminService.create(createUserDto, file);
    }

    @Patch(':id') 
    @UseInterceptors(
        FileInterceptor('image', {
          storage: diskStorage({
            destination: './uploads/users',
            filename: (req, file, cb) => {
              const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
              cb(null, `${randomName}${extname(file.originalname)}`);
            },
          }),
        }),
    )
    @Serialize(UserDto, 'User updated successfully.')
    update(@Body() updateUserDto: UpdateUserDto, @Param('id') id, @UploadedFile() file: Express.Multer.File) {
        return this.usersAdminService.update(updateUserDto, +id, file);
    }
  
    @Delete(':id')
    @Serialize(UserDto, 'User deleted successfully.')
    remove(@Param('id') id: string) {
        return this.usersAdminService.remove(+id);
    }
}