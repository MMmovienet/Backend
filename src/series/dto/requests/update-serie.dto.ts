import { PartialType } from '@nestjs/mapped-types';
import { CreateSerieDto } from './create-serie.dto';
import { IsString } from 'class-validator';

export class UpdateSerieDto extends PartialType(CreateSerieDto) {
    @IsString({message: "Slug is required"})
    slug: string;
}
