import { HttpStatus, Injectable } from '@nestjs/common';
import { scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { Not, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/requests/create-user.dto';
import { UpdateUserDto } from './dto/requests/update-user.dto';
import { LoginUserDto } from './dto/requests/login-user.dto';
import { User } from './entities/user.entity';
import { generatePassword, throwCustomError, unlinkFile } from 'src/common/helper';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { Post } from 'src/posts/entities/post.entity';
import { PostsService } from 'src/posts/posts.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly postsService: PostsService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const [user] = await this.userRepository.find({ where: { email: loginUserDto.email } });
    if(!user) {
      throwCustomError('Your credentials is incorrect.', HttpStatus.UNAUTHORIZED);
    }   
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(loginUserDto.password, salt, 32)) as Buffer;
    if(storedHash !== hash.toString('hex')) {
      throwCustomError('Your password is incorrect!', HttpStatus.UNAUTHORIZED);
    }
    const token = await this.generateToken({ id: user.id, email: user.email })
    return {...user, access_token: token};
  }

  async register(createUserDto: CreateUserDto) {
    const hashPassword = await generatePassword(createUserDto.password)
    const userInstance = this.userRepository.create({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashPassword
    });
    const user = await this.userRepository.save(userInstance);
    const token = await this.generateToken({ id: user.id, email: user.email })
    return {...user, access_token: token};
  }

  async update(updateUserDto: UpdateUserDto, user, file: Express.Multer.File) {
    if(updateUserDto.email) {
      const existedUser = await this.userRepository.findOne({where: {email: updateUserDto.email, id: Not(user.id)}});
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

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({where: {id}});
    if(!user) {
        throwCustomError("User not found.")
    }
    return user!;
  }

  async getPosts(query: PaginateQuery, user: User): Promise<Paginated<Post>> {
    return this.postsService.findAll(query, user.id);
  }

  async getPostsByUser(query: PaginateQuery, id: number): Promise<Paginated<Post>> {
    await this.findOne(id);
    return this.postsService.findAll(query, +id);
  }

  async generateToken(payload) {
    return this.jwtService.signAsync(payload);
  }
}
