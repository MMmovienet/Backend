import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CreatePartyDto } from '../parties/dto/requests/create-party.dto';
import { UpdatePartyDto } from '../parties/dto/requests/update-party.dto';
import { UserGuard } from 'src/common/guards/user.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PartyDto } from '../parties/dto/responses/party.dto';
import { PartiesService } from './parties.service';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Party } from './entities/party.entity';

@Controller('parties')
@Serialize(PartyDto)
@UseGuards(UserGuard)
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Post()
  create(@Body() createPartyDto: CreatePartyDto, @Request() req) {
    return this.partiesService.create(createPartyDto, req.user);
  }

  @Get()
  findAll(@Paginate() query: PaginateQuery, @Request() req): Promise<Paginated<Party>> {
    return this.partiesService.findAll(query, req.user);
  }

  @Get(':partyId')
  getParty(@Param('partyId') partyId: string) {
    return this.partiesService.getParty(partyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartyDto: UpdatePartyDto) {
    return this.partiesService.update(+id, updatePartyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partiesService.remove(+id);
  }
}
