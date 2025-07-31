import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { IsUnique } from "src/common/validators/is-unique.constraint ";

export class CreateEpisodeDto {
    @Transform(({ value }) => { 
        return typeof value === 'string' ? JSON.parse(value) : value;
    })
    @IsNumber({}, {message: "Episode number is required."})
    number: number;

    @IsString({message: "Episode name is required."})
    name: string;
    
    @IsString({message: "Slug is required"})
    @IsUnique({tableName: 'episodes', column: 'slug'})
    slug: string;

    @IsOptional()
    @IsString({message: "Video source is required."})
    src: string;

    @IsOptional()
    @IsString()
    description: string;

    @Transform(({ value }) => { 
        return typeof value === 'undefined' ? null : value;
    })
    @IsOptional()
    seasonId: number;
}