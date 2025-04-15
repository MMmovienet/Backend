import { Body, Controller, Delete, Param, Patch, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { EpisodeDto } from "../dto/responses/episode.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { EpisodesAdminService } from "./episodes-admin.service";
import { UpdateEpisodeDto } from "../dto/requests/update-episode.dto";

@Controller("admins/episodes")
@UseGuards(AdminGuard)
export class EpisodesAdminController {
    constructor(
        private episodesAdminService: EpisodesAdminService,
    ){}

    @Patch(":id")
    @Serialize(EpisodeDto, "Episode updated successfully.")
    @UseInterceptors(
        FileInterceptor('src', {
            storage: diskStorage({
            destination: './uploads/series/episodes',
            filename: (req, file, cb) => {
                    const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    update(@Param('id') id: string, @Body() updateEpisodeDto: UpdateEpisodeDto, @UploadedFile() file: Express.Multer.File) {
        return this.episodesAdminService.update(+id, updateEpisodeDto, file);
    }

    @Delete(':id')
    @Serialize(EpisodeDto, "Episode deleted successfully.")
    delete(@Param('id') id: string) {
        return this.episodesAdminService.delete(+id);
    }
}