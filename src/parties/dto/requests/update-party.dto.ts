import { IsString } from 'class-validator';

export class UpdatePartyDto {
    @IsString({message: "User email is required."})
    email: string
}
