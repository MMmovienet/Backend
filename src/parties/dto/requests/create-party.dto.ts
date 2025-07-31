import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePartyDto {
    @IsNumber()
    @IsOptional()
    movieId: string;

    @IsNumber()
    @IsOptional()
    episodeId: number;
}
