import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './create-genre.dto';
import { IsString } from 'class-validator';

export class UpdateGenreDto {
    @IsString({message: "Name is required."})
    name: string
}
