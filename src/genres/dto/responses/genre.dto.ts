import { Expose } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";

export class GenreDto extends BaseDto {
    @Expose()
    name: string;
}