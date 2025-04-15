import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePartyDto {
    @IsString()
    @IsOptional()
    movieId: string;

    @IsNumber()
    @IsOptional()
    episodeId: number;
}
