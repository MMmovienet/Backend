import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PartyService } from './party.service';
import { CreatePartyDto } from './dto/requests/create-party.dto';
import { UpdatePartyDto } from './dto/requests/update-party.dto';
import { UserGuard } from 'src/common/guards/user.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PartyDto } from './dto/responses/party.dto';

@Controller('parties')
@Serialize(PartyDto)
@UseGuards(UserGuard)
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post()
  create(@Body() createPartyDto: CreatePartyDto, @Request() req) {
    return this.partyService.create(createPartyDto, req.user);
  }

  @Get()
  findAll() {
    return this.partyService.findAll();
  }

  @Get(':partyId')
  getParty(@Param('partyId') partyId: string) {
    return this.partyService.getParty(partyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartyDto: UpdatePartyDto) {
    return this.partyService.update(+id, updatePartyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partyService.remove(+id);
  }
}
