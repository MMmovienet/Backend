import { Controller, Post, Body, Patch, UseInterceptors, Request, UploadedFile, UseGuards, Get, Param, Inject, Query } from '@nestjs/common';
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
import { PostDto } from 'src/posts/dto/responses/post.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Post as PostEntity } from 'src/posts/entities/post.entity';
import { VerifyUserDto } from './dto/requests/verify-user.dto';
import { ResetPasswordDto } from './dto/requests/reset-password.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('/login')
    @Serialize(AuthUserDto, 'Successfully logined.')
    login(@Body() loginUserDto: LoginUserDto) {
        return this.usersService.login(loginUserDto);
    }

    @Post('/register')
    @Serialize(AuthUserDto, 'Please verify your account.')
    register(@Body() createUserDto: CreateUserDto) {
        return this.usersService.register(createUserDto);
    }

    @Post('/verify')
    @Serialize(AuthUserDto, 'Account verification success.')
    verify(@Body() verifyUserDto: VerifyUserDto) {
        return this.usersService.verify(verifyUserDto.email, +verifyUserDto.otp)
    }

    @Get('/resend-otp/:email')
    @Serialize(UserDto, 'OTP Code was sent.')
    resendOtp(@Param('email') email: string, @Query('status') isVerify: string) {
        const resendStatus = isVerify ? true : false;
        return this.usersService.resendOtpCode(email, resendStatus);
    }

    @Get('/forgot-password/:email')
    @Serialize(UserDto, 'OTP code was sent that will allow you to set a new password.')
    forgotPassword(@Param('email') email: string) {
        return this.usersService.forgotPassword(email);
    }

    @Post('/reset-password')
    @Serialize(UserDto, 'Successfully updated your password')
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.usersService.resetPassword(
            resetPasswordDto.email,
            +resetPasswordDto.otp,
            resetPasswordDto.password,
        );
    }

    @Patch()
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

    @Get('posts')
    @Serialize(PostDto) 
    @UseGuards(UserGuard)
    async getPosts(@Paginate() query: PaginateQuery, @Request() req): Promise<Paginated<PostEntity>> {
        return this.usersService.getPosts(query, req.user);
    }

    @Get(':id')
    @Serialize(UserDto)
    getUserProfile(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }
    
    @Get(':id/posts')
    @Serialize(PostDto) 
    async getPostsByUser(@Param('id') id: string, @Paginate() query: PaginateQuery): Promise<Paginated<PostEntity>> {
        return this.usersService.getPostsByUser(query, +id);
    }
}
