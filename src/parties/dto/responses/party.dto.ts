import { Expose, Transform, Type } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";
import { EpisodeDto } from "src/episodes/dto/responses/episode.dto";
import { MovieDto } from "src/movies/dto/responses/movie.dto";
import { UserDto } from "src/users/dto/responses/user.dto";

export class PartyDto extends BaseDto {
    @Expose()
    partyId: string;

    @Expose()
    title: string;

    @Expose()
    @Transform(({value}) => `${process.env.APP_URL}/uploads/movies/${value}`)
    src: string;

    @Expose()
    @Transform(({value}) => `${process.env.APP_URL}/uploads/posters/${value}`)
    poster: string;

    @Expose()
    @Type(() => MovieDto)
    movie: MovieDto;

    @Expose()
    @Type(() => EpisodeDto)
    episode: EpisodeDto;

    @Expose()
    @Type(() => UserDto)
    admin: MovieDto;

    @Expose()
    @Type(() => UserDto)
    members: UserDto[]
}