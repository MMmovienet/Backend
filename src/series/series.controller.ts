import { Controller, Get, Param } from '@nestjs/common';
import { SeriesService } from './series.service';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Serie } from './entities/serie.entity';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { SerieDto } from './dto/responses/serie.dto';
import { EpisodeDto } from 'src/episodes/dto/responses/episode.dto';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  @Serialize(SerieDto)
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Serie>> {
    return this.seriesService.findAll(query);
  }

  @Get(':id')
  @Serialize(SerieDto)
  findOne(@Param('id') id: string) {
    return this.seriesService.findOne(+id);
  }

  @Get(':id/episodes/:episodeId')
  @Serialize(EpisodeDto)
  getEpisode(@Param('id') id: string, @Param('episodeId') episodeId: string) {
    return this.seriesService.getEpisode(+id, +episodeId)
  }

  @Get('/search/:keyword')
  @Serialize(SerieDto)
  search(@Param('keyword') keyword: string) {
    return this.seriesService.search(keyword);
  }
}
