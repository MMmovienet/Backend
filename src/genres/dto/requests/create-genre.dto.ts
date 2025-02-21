import { IsString } from "class-validator";
import { IsUnique } from "src/common/validators/is-unique.constraint ";

export class CreateGenreDto {
    @IsString({message: "Name is required."})
    @IsUnique({tableName: 'genres', column: 'name'})
    name: string
}
