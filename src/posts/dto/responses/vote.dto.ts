import { Expose } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";
import { VoteType } from "src/common/enums/VoteType";

export class VoteDto extends BaseDto {
    @Expose()
    type: VoteType;

    @Expose()
    userId: number;

    @Expose()
    postId: number;
}