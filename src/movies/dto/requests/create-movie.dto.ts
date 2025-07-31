import { Transform } from "class-transformer";
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsOptional, IsString } from "class-validator";
import { IsUnique } from "src/common/validators/is-unique.constraint ";

export class CreateMovieDto {
    @IsString({message: "Movie name is required"})
    name: string;

    @IsString({message: "Slug is required"})
    @IsUnique({tableName: 'movies', column: 'slug'})
    slug: string;

    @IsString({message: "Movie description is required"})
    description: string;

    @IsString({message: "Release date is required"})
    release_date: string;

    @IsOptional()
    @IsString({message: "Movie source is required"})
    src: Express.Multer.File;

    @IsOptional()
    @IsString({message: "Poster is required"})
    main_poster: Express.Multer.File;

    @IsOptional()
    @IsString()
    cover_poster: Express.Multer.File;

    @Transform(({ value }) => { 
        if (typeof value === 'string') {
            return value.split(',').map(Number);
        }
        return value;
    })
    @IsArray({ message: "Genres must be an array." })
    @ArrayNotEmpty({ message: "Genres array should not be empty." })
    @ArrayMinSize(1, { message: "At least one genre must be selected." })
    genres: number[];
}
