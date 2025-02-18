import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/requests/create-admin.dto';
import { UpdateAdminDto } from './dto/requests/update-admin.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Admin } from './entities/admin.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AdminDto } from './dto/responses/admin.dto';
import { AuthAdminDto } from './dto/responses/auth-admin.dto';
import { LoginAdminDto } from './dto/requests/login-admin.dto';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
  create(@Body() createAdminDto: CreateAdminDto, @UploadedFile() file: Express.Multer.File) {
    return this.adminService.create(createAdminDto, file);
  }

  @Get()
  @Serialize(AdminDto)
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Admin>> {
    return this.adminService.findAll(query);
  }

  @Get(':id')
  @Serialize(AdminDto)
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
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
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto, @UploadedFile() file: Express.Multer.File) {
    return this.adminService.update(+id, updateAdminDto, file);
  }

  @Delete(':id')
  @Serialize(AdminDto, 'Admin deleted successfully.')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }

  @Post('/login')
  @Serialize(AuthAdminDto, 'Successfully login.')
  login(@Body() body: LoginAdminDto) {
    return this.adminService.login(body);
  }
}
