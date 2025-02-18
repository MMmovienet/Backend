import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { IsUnique } from "src/common/validators/is-unique.constraint ";

export class CreateAdminDto {
    @IsString({message: "Name is required."})
    name: string;

    @IsString()
    @IsUnique({tableName: 'admin', column: 'email'})
    @IsEmail({}, {message: "Email must be a valid email."})
    email: string;

    @IsString()
    @IsOptional()
    image: string;

    @IsString()
    @MinLength(6, {message: "Password must be at least 6 characters."})
    password: string;
}
