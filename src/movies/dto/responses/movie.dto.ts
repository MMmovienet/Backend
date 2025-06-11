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
    release_date: string;

    @Expose()
    @Transform(({value}) => `${process.env.APP_URL}/movies/${value}/watch`)
    src: string;

    @Expose()
    @Transform(({value}) => `${process.env.APP_URL}/uploads/posters/${value}`)
    main_poster: string;

    @Expose()
    @Transform(({value}) => value ? `${process.env.APP_URL}/uploads/posters/${value}` : null)
    cover_poster?: string;

    @Expose()
    @Type(() => GenreDto)
    genres: GenreDto[];

    @Expose()
    @Type(() => PosterDto)
    posters?: PosterDto[]
}