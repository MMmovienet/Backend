import { Expose, Transform } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";

export class AdminDto extends BaseDto {
    @Expose()
    name: string;

    @Expose()
    email: string

    @Expose()
    @Transform(({value}) => value ? `${process.env.APP_URL}/uploads/admins/${value}`: null)
    image: string
}