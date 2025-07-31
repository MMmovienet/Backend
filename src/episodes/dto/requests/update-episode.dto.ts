import { PartialType } from "@nestjs/mapped-types";
import { CreateEpisodeDto } from "./create-episode.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateEpisodeDto extends PartialType(CreateEpisodeDto) {
    @IsString({message: "Slug is required"})
    @IsOptional()
    slug: string;
}