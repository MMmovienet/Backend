import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Request, UseGuards } from '@nestjs/common';
import { CreateAdminDto } from '../admins/dto/requests/create-admin.dto';
import { UpdateAdminDto } from '../admins/dto/requests/update-admin.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Admin } from '../admins/entities/admin.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AdminDto } from '../admins/dto/responses/admin.dto';
import { AuthAdminDto } from '../admins/dto/responses/auth-admin.dto';
import { LoginAdminDto } from '../admins/dto/requests/login-admin.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { AdminsService } from './admins.service';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('/profile')
  @Serialize(AdminDto)
  @UseGuards(AdminGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('/login')
  @Serialize(AuthAdminDto, 'Successfully login.')
  login(@Body() body: LoginAdminDto) {
    return this.adminsService.login(body);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/admins',
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
  @Serialize(AdminDto, 'Admin created successfully.')
  @UseGuards(AdminGuard)
  create(@Body() createAdminDto: CreateAdminDto, @UploadedFile() file: Express.Multer.File) {
    return this.adminsService.create(createAdminDto, file);
  }

  @Get()
  @Serialize(AdminDto)
  @UseGuards(AdminGuard)
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Admin>> {
    return this.adminsService.findAll(query);
  }

  @Get(':id')
  @Serialize(AdminDto)
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/admins',
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
  @Serialize(AdminDto, 'Admin updated successfully.')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto, @UploadedFile() file: Express.Multer.File) {
    return this.adminsService.update(+id, updateAdminDto, file);
  }

  @Delete(':id')
  @Serialize(AdminDto, 'Admin deleted successfully.')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.adminsService.remove(+id);
  }
}
