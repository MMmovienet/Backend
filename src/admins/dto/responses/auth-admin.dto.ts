import { PartialType } from "@nestjs/mapped-types";
import { AdminDto } from "./admin.dto";
import { Expose } from "class-transformer";

export class AuthAdminDto extends PartialType(AdminDto) {
    @Expose()
    access_token: string;
}