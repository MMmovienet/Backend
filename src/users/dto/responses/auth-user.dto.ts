import { PartialType } from "@nestjs/mapped-types";
import { Expose } from "class-transformer";
import { UserDto } from "./user.dto";

export class AuthUserDto extends PartialType(UserDto) {
    @Expose()
    access_token: string;
}