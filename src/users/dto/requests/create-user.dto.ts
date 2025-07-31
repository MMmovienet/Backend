import { IsEmail, IsOptional, IsString, min, MinLength } from "class-validator";
import { IsUnique } from "src/common/validators/is-unique.constraint ";

export class CreateUserDto {
    @IsString({message: 'Name is required'})
    name: string;

    @IsString()
    @IsOptional()
    username: string;

    @IsString({message: 'Email is required'})
    @IsUnique({tableName: 'users', column: 'email'})
    @IsEmail({}, {message: 'Email must be a valid email'})
    email: string;

    @IsString()
    @IsOptional()
    image: string;

    @IsString()
    @MinLength(6, {message: "Password must be at least 6 characters."})
    password: string;
}
