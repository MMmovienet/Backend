import { IsEnum } from "class-validator";
import { VoteType } from "src/common/enums/VoteType";

export class VotePostDto {
    @IsEnum(VoteType, {message: 'Type must be UP or DOWN'})
    type: string;
}
