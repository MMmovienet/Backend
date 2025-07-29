import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class VerifyUserDto {
    @IsString()
    @IsEmail({}, {message: 'Email must be a valid email.'})
    email: string;

    @IsString()
    @MinLength(6, {message: "OTP Code must be 6 characters."})
    @MaxLength(6, {message: "OTP Code must be 6 characters."})
    otp: string;
}