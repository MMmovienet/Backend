import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
        @IsString({message: 'Email must be a string'})
        @IsEmail({}, {message: 'Email must be a valid email'})
        email: string;
}
