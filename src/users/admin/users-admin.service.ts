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
        let username = createUserDto.email.split('@')[0];
        const existedUserByUsername = await this.userRepository.findOne({where: {username}});
        if(existedUserByUsername) {
            username = username + (Math.floor(Math.random() * 900000) + 100000);
        }
        const userInstance = this.userRepository.create({
            name: createUserDto.name,
            username: username,
            email: createUserDto.email,
            password: hashPassword,
            image: fileName
        });
        const user = await this.userRepository.save(userInstance);
        return user;
    }

    async update(updateUserDto: UpdateUserDto, id: number, file: Express.Multer.File): Promise<User> {
        const user: User = await this.findOne(id);
        const existedUserByEmail = await this.userRepository.findOne({where: {email: updateUserDto.email, id: Not(user.id)}});
        if(existedUserByEmail) {
            throwCustomError('An account with this email already exists.');
        }
        const existedUserByUsername = await this.userRepository.findOne({where: {username: updateUserDto.username, id: Not(user.id)}});
        if(existedUserByUsername) {
            throwCustomError('An account with this username already exists.');
        }
        Object.assign(user, {
            name: updateUserDto.name,
            username: updateUserDto.username,
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
        const user = await this.userRepository.findOne({where: {id}, relations: ['parties', 'member_parties']}); 
        if(!user) {
            throwCustomError('User not found.');
        }
        return user!;
    }

    async find(email: string): Promise<User[]> {
        return this.userRepository.find({where: {email}});
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