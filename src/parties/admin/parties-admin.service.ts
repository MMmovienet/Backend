import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Party } from "../entities/party.entity";
import { paginate, PaginateConfig, Paginated, PaginateQuery } from "nestjs-paginate";
import { throwCustomError } from "src/common/helper";

@Injectable()
export class PartiesAdminService {
    constructor(
        @InjectRepository(Party) private partiesAdminRepository: Repository<Party>,
    ){}

    async findAll(query: PaginateQuery): Promise<Paginated<Party>> {
        const config: PaginateConfig<Party> = {
            sortableColumns: ['id'],
            maxLimit: 10,
            defaultSortBy: [['createdAt', 'DESC']],
            relations: ['admin']
        }
        query.limit = query.limit == 0 ? 10 : query.limit;
        const result = await paginate<Party>(query, this.partiesAdminRepository, config);
        return result;
    }

    async findOne(id: number) {
        const party = await this.partiesAdminRepository.findOne({where: {id}, relations: ['movie', 'episode', 'admin', 'members']});
        if(!party) {
            throwCustomError("Party not found.")
        }
        return party!;
    }

    async findByPartyIds(ids: string[]) {
        const parties = await this.partiesAdminRepository.find({
            where: {
                partyId: In(ids),
            },
            relations: ['admin', 'members']
        });
        return parties;
    }
}