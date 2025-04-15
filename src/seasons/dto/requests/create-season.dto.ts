import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSeasonDto {
    @Transform(({value}) => {
        return typeof value === "string" ? JSON.parse(value) : value
    })
    @IsNumber({}, {message: "Season number is required."})
    number: number;

    @IsString({message: "Season name is required."})
    name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    release_date: string;
}