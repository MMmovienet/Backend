import { PartialType } from '@nestjs/mapped-types';
import { CreatePartyDto } from './create-party.dto';
import { IsString } from 'class-validator';

export class UpdatePartyDto extends PartialType(CreatePartyDto) {
    @IsString({message: "User email is required."})
    email: string
}
