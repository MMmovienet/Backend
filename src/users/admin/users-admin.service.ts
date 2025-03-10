import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Not, Repository } from "typeorm";
import { CreateUserDto } from "../dto/requests/create-user.dto";
import { generatePassword, throwCustomError, unlinkFile } from "src/common/helper";
import { UpdateUserDto } from "../dto/requests/update-user.dto";
import { paginate, PaginateConfig, Paginated, PaginateQuery } from "nestjs-paginate";

@Injectable()
export class UsersAdminService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ){}

    async create(createUserDto: CreateUserDto, file: Express.Multer.File) {
        const hashPassword = await generatePassword(createUserDto.password)
        let fileName: string | null = null;
        if(file) {
            fileName = file.filename;
        }
        const userInstance = this.userRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            password: hashPassword,
            image: fileName
        });
        const user = await this.userRepository.save(userInstance);
        return user;
    }

    async update(updateUserDto: UpdateUserDto, id, file: Express.Multer.File): Promise<User> {
        const user: User = await this.findOne(id);
        if(updateUserDto.email) {
          const existedUser = await this.userRepository.findOne({where: {email: updateUserDto.email, id: Not(id)}});
          if(existedUser) {
              throwCustomError('Email has already exist.');
          }
        }
        Object.assign(user, {
            name: updateUserDto.name,
            email: updateUserDto.email,
        });
    
        if(updateUserDto.password) {
          user.password = await generatePassword(updateUserDto.password)
        }
    
        if(file) {
            if(user.image) await unlinkFile('users', user.image);
            user.image = file.filename;
        }
        
        return this.userRepository.save(user);
    }

    async findAll(query: PaginateQuery): Promise<Paginated<User>> {
        const config: PaginateConfig<User> = {
            sortableColumns: ['id', 'name', 'email'],
            maxLimit: 10,
            defaultSortBy: [['createdAt', 'DESC']]
        }
        query.limit = query.limit == 0 ? 10 : query.limit;
        const result = await paginate<User>(query, this.userRepository, config)
        return result;
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({where: {id}}); 
        if(!user) {
            throwCustomError('User not found.');
        }
        return user!;
    }

    async remove(id: number): Promise<User> {
        const user = await this.findOne(id);
        if(user!.image) {
            await unlinkFile('users', user!.image);
        }
        await this.userRepository.remove(user!);
        return user;
    }
}