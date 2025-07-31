import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';
import { IsString } from 'class-validator';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
    @IsString({message: "Slug is required"})
    slug: string;
}
