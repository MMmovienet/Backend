import { Expose, Type } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";
import { MovieDto } from "src/movies/dto/responses/movie.dto";
import { UserDto } from "src/users/dto/responses/user.dto";

export class PartyDto extends BaseDto {
    @Expose()
    partyId: string;

    @Expose()
    @Type(() => MovieDto)
    movie: MovieDto;

    @Expose()
    @Type(() => UserDto)
    admin: MovieDto;

    @Expose()
    @Type(() => UserDto)
    members: UserDto[]
}