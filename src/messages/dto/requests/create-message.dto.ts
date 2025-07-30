import { IsString } from "class-validator";

export class CreateMessageDto {
    @IsString({message: "Message is required."})
    text: string;
}
