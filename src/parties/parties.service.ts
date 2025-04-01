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

@Injectable()
export class PartiesService {
    constructor(
        @InjectRepository(Party) private partiesRepository: Repository<Party>,
        private readonly moviesService: MoviesService,
        private readonly usersService: UsersAdminService,
    ) {}

    generatePartyIdString(name: string): string {
        const randomFourCharsFromName = getRandomCharsFromString(name, 4);
        const str = randomFourCharsFromName + Date.now().toString();
        return str
            .split('')                     
            .sort(() => Math.random() - 0.5) 
            .join(''); 
    }

    async create(createPartyDto: CreatePartyDto, user: User) {
        const movie = await this.moviesService.findOne(+createPartyDto.movieId);
        const partyInstance = this.partiesRepository.create({
            partyId: this.generatePartyIdString(user.name),
            movie: movie!,
            admin: user,
            members: [user],
        });
        return this.partiesRepository.save(partyInstance);
    }

    findAll() {
        return `This action returns all party`;
    }

    getParty(partyId: string) {
        return this.partiesRepository.findOne({where: {partyId}, relations: ['movie', 'admin', 'members']});
    }

    async findOne(id: number): Promise<Party> {
        const party = await this.partiesRepository.findOne({where: {id}, relations: ['movie', 'admin', 'members']});
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
