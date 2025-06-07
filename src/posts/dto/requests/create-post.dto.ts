import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class CreatePostDto {
    @IsString({message: "Text is required."})
    text: string;

    @Transform(({ value }) => { 
        return typeof value === 'undefined' ? null : value;
    })
    @IsOptional()
    movieId: number;

    @Transform(({ value }) => { 
        return typeof value === 'undefined' ? null : value;
    })
    @IsOptional()
    serieId: number;
}
