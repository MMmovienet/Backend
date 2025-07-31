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

  @Get(':slug')
  @Serialize(SerieDto)
  findOne(@Param('slug') slug: string) {
    return this.seriesService.findBySlug(slug);
  }

  @Get(':serie_slug/episodes/:episode_slug')
  @Serialize(EpisodeDto)
  getEpisode(@Param('serie_slug') serie_slug: string, @Param('episode_slug') episode_slug: string) {
    return this.seriesService.getEpisode(serie_slug, episode_slug)
  }

  @Get('/search/:keyword')
  @Serialize(SerieDto)
  search(@Param('keyword') keyword: string) {
    return this.seriesService.search(keyword);
  }
}
