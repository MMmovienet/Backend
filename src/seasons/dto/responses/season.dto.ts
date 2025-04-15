import { Expose, Type } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";
import { EpisodeDto } from "../../../episodes/dto/responses/episode.dto";
import { SerieDto } from "../../../series/dto/responses/serie.dto";

export class SeasonDto extends BaseDto {
    @Expose()
    number: number;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    release_date?: string;

    @Expose()
    @Type(() => SerieDto)
    serie?: SerieDto;

    @Expose()
    @Type(() => EpisodeDto)
    episodes?: EpisodeDto[];
}