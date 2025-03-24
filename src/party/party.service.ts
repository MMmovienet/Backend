import { Injectable } from '@nestjs/common';
import { CreatePartyDto } from './dto/requests/create-party.dto';
import { UpdatePartyDto } from './dto/requests/update-party.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Party } from './entities/party.entity';
import { Repository } from 'typeorm';
import { MoviesService } from 'src/movies/movies.service';
import { getRandomCharsFromString } from 'src/common/helper';

@Injectable()
export class PartyService {
    constructor(
        @InjectRepository(Party) private partyRepository: Repository<Party>,
        private readonly moviesService: MoviesService,
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
        const partyInstance = this.partyRepository.create({
            partyId: this.generatePartyIdString(user.name),
            movie: movie!,
            admin: user,
            members: [user],
        });
        return this.partyRepository.save(partyInstance);
    }

    findAll() {
        return `This action returns all party`;
    }

    findOne(id: number) {
        return `This action returns a #${id} party`;
    }

    update(id: number, updatePartyDto: UpdatePartyDto) {
        return `This action updates a #${id} party`;
    }

    remove(id: number) {
        return `This action removes a #${id} party`;
    }
}
