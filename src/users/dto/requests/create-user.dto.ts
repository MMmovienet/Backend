import { IsEmail, IsOptional, IsString, min, MinLength } from "class-validator";
import { IsUnique } from "src/common/validators/is-unique.constraint ";

export class CreateUserDto {
    @IsString({message: 'Name must be a string'})
    name: string;

    @IsString({message: 'Email must be a string'})
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
