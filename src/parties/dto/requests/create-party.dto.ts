import { IsNumber, IsString } from "class-validator";

export class CreatePartyDto {
    @IsString({message: "Movie is required."})
    movieId: string;
}
