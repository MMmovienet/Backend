import { Expose, Transform } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";

export class UserDto extends BaseDto {
    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    @Transform(({value}) => value ? `${process.env.APP_URL}/uploads/users/${value}`: null)
    image: string;
}