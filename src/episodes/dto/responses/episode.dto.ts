import { Expose, Transform, Type } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";
import { SeasonDto } from "src/seasons/dto/responses/season.dto";
import { SerieDto } from "src/series/dto/responses/serie.dto";

export class EpisodeDto extends BaseDto {
    @Expose()
    number: number;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    @Transform(({value}) => `${process.env.APP_URL}/movies/${value}/watch`)
    src: string;

    @Expose()
    serieId: number;

    @Expose()
    seasonId: number;

    @Expose()
    @Type(() => SerieDto)
    serie: SerieDto;

    @Expose()
    @Type(() => SeasonDto)
    season: SeasonDto;
}