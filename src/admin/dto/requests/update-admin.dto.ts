import { IsEmail, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
    @IsString()
    @IsEmail({}, {message: "Email must be a valid email."})
    email: string;
}
