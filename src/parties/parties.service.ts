import { Injectable } from '@nestjs/common';
import { CreatePartyDto } from '../parties/dto/requests/create-party.dto';
import { UpdatePartyDto } from '../parties/dto/requests/update-party.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Party } from '../parties/entities/party.entity';
import { Repository } from 'typeorm';
import { MoviesService } from 'src/movies/movies.service';
import { getRandomCharsFromString, throwCustomError } from 'src/common/helper';
import { UsersAdminService } from 'src/users/admin/users-admin.service';
import { EpisodesAdminService } from 'src/episodes/admin/episodes-admin.service';

@Injectable()
export class PartiesService {
    constructor(
        @InjectRepository(Party) private partiesRepository: Repository<Party>,
        private readonly moviesService: MoviesService,
        private readonly episodesAdminService: EpisodesAdminService,
        private readonly usersService: UsersAdminService,
    ) {}

    async generatePartyIdString(name: string): Promise<string> {
        const randomFourCharsFromName = getRandomCharsFromString(name, 4);
        const str = randomFourCharsFromName + Date.now().toString();
        const partyIdString = str
            .split('')                     
            .sort(() => Math.random() - 0.5) 
            .join(''); 
        const party = await this.partiesRepository.findOne({where: {partyId: partyIdString}});
        if(party) {
            return this.generatePartyIdString(name)
        }
        return partyIdString;
    }

    async create(createPartyDto: CreatePartyDto, user: User) {
        const movie = createPartyDto.movieId ? (await this.moviesService.findOne(+createPartyDto.movieId))! : undefined;
        const episode = createPartyDto.episodeId ? (await this.episodesAdminService.findOne(+createPartyDto.episodeId))! : undefined;
        if ((!movie && !episode) || (movie && episode)) {
            throwCustomError('Either movieId or episodeId must be provided');
        }
        let title;
        let src;
        let poster;
        if(movie) {
            title = movie.name;
            src = movie.src;
            poster = movie.main_poster;
        }
        if(episode) {
            title = `${episode.serie.name} (${episode.season ? episode.season.name + ' - ' : ''} ${episode.name})`;
            src = episode.src;
            poster = episode.serie.main_poster;
        }

        const partyInstance = this.partiesRepository.create({
            partyId: await this.generatePartyIdString(user.name),
            title: title,
            src: src,
            poster: poster,
            movie: movie,
            episode: episode,
            admin: user,
        });
        return this.partiesRepository.save(partyInstance);
    }

    findAll() {
        return `This action returns all party`;
    }

    async getParty(partyId: string) {
        const party = await this.partiesRepository.findOne({where: {partyId}, relations: ['movie', 'episode', 'admin', 'members']});
        if(!party) {
            throwCustomError('Party not found.');
        }
        return party;
    }

    async findOne(id: number): Promise<Party> {
        const party = await this.partiesRepository.findOne({where: {id}, relations: ['movie', 'episode', 'admin', 'members']});
        if(!party) {
            throwCustomError('User not found.');
        }
        return party!;
    }

    async update(id: number, updatePartyDto: UpdatePartyDto) {
        const party = await this.findOne(id);
        const [user] = await this.usersService.find(updatePartyDto.email);
        if(!user) {
            throwCustomError('User not found.');
        }
        if (!party.members.some(member => member.id === user.id)) {
            party.members.push(user);
            return this.partiesRepository.save(party);
        } 
        throwCustomError('This user is already a member of the party.');
    }

    remove(id: number) {
        return `This action removes a #${id} party`;
    }
}
