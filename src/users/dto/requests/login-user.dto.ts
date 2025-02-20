import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginUserDto {
    @IsString()
    @IsEmail({}, {message: 'Email must be a valid email.'})
    email: string;

    @IsString()
    @MinLength(6, {message: "Password must be at least 6 characters."})
    password: string;
}