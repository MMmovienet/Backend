import { Expose, Type } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";
import { UserDto } from "src/users/dto/responses/user.dto";

export class MessageDto extends BaseDto {
    @Expose()
    text: string;

    @Expose()
    @Type(() => UserDto)
    user: UserDto;
}