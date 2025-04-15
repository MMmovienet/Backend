import { Expose, Transform, Type } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";
import { GenreDto } from "src/genres/dto/responses/genre.dto";
import { EpisodeDto } from "../../../episodes/dto/responses/episode.dto";
import { SeasonDto } from "../../../seasons/dto/responses/season.dto";

export class SerieDto extends BaseDto {
    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    release_date: string;

    @Expose()
    @Transform(({value}) => `${process.env.APP_URL}/uploads/series/posters/${value}`)
    main_poster: string;

    @Expose()
    @Transform(({value}) => value ? `${process.env.APP_URL}/uploads/series/posters/${value}` : null)
    cover_poster?: string;

    @Expose()
    @Type(() => GenreDto)
    genres: GenreDto[];

    @Expose()
    @Type(() => SeasonDto)
    seasons?: SeasonDto[];

    @Expose()
    @Type(() => EpisodeDto)
    episodes: EpisodeDto[]
}