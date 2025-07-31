import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
        @IsString({message: 'Email is required.'})
        @IsEmail({}, {message: 'Email must be a valid email.'})
        email: string;

        @IsString({message: 'Username is required.'})
        username: string;

        @IsString()
        @IsOptional()
        password: string;
}
