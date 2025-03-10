import { Expose, Transform, Type } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";
import { GenreDto } from "src/genres/dto/responses/genre.dto";
import { PosterDto } from "./poster.dto";

export class MovieDto extends BaseDto {
    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    @Transform(({value}) => `${process.env.APP_URL}/uploads/movies/${value}`)
    src: string;

    @Expose()
    @Type(() => GenreDto)
    genres: GenreDto[];

    @Expose()
    @Type(() => PosterDto)
    posters?: PosterDto[]
}