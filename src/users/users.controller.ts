import { Controller, Post, Body, Patch, UseInterceptors, Request, UploadedFile, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/requests/create-user.dto';
import { UpdateUserDto } from './dto/requests/update-user.dto';
import { LoginUserDto } from './dto/requests/login-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserGuard } from 'src/common/guards/user.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserDto } from './dto/responses/user.dto';
import { AuthUserDto } from './dto/responses/auth-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/login')
  @Serialize(AuthUserDto, 'Successfully logined.')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  @Post('/register')
  @Serialize(AuthUserDto, 'Successfully registered.')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Patch('')
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
  @Serialize(UserDto, 'Successfully updated.')
  @UseGuards(UserGuard)
  update(@Body() updateUserDto: UpdateUserDto, @Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.update(updateUserDto, req.user, file);
  }

  @Get('profile')
  @Serialize(UserDto)
  @UseGuards(UserGuard)
  findOne(@Request() req) {
      return req.user;
  }
}
