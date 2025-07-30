import { HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MailerService } from '@nestjs-modules/mailer';

const scrypt = promisify(_scrypt);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly postsService: PostsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailerService
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const user = await this.findByEmail(loginUserDto.email);
    if(!user) {
      throwCustomError('Your credentials is incorrect.', HttpStatus.UNAUTHORIZED);
    }   
    if(user!.verifiedAt === null) {
      await this.storeOtpAndSendToUserMail(user!.email, 'Use this code to complete your verification.')
      throwCustomError('Please verified your account.', HttpStatus.FORBIDDEN)
    }
    const [salt, storedHash] = user!.password.split('.');
    const hash = (await scrypt(loginUserDto.password, salt, 32)) as Buffer;
    if(storedHash !== hash.toString('hex')) {
      throwCustomError('Your password is incorrect!', HttpStatus.UNAUTHORIZED);
    }
    const token = await this.generateToken({ id: user!.id, email: user!.email })
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

    await this.storeOtpAndSendToUserMail(user!.email, 'Use this code to complete your verification.')
    return user;
  }

  async verify(email: string, otp: number) {
    const storedOtp = await this.cacheManager.get(`${email}_otp_code`);
    if(storedOtp !== otp) {
      throwCustomError("Invalid OTP code!")
    } 
    const user = await this.findByEmail(email);
    user!.verifiedAt = new Date();
    await this.userRepository.save(user!);
    const token = await this.generateToken({ id: user!.id, email: user!.email })
    return {...user, access_token: token};
  }

  async resendOtpCode(email: string, isVerify) {
    const user = await this.findByEmail(email);
    if(!user) {
      throwCustomError('Please register first!');
    }
    if(isVerify && user!.verifiedAt !== null) {
      throwCustomError('You are already verified.')
    }
    const text = isVerify ? 'Use this code to complete your verification.' : 'Use this code to reset your password.';
    await this.storeOtpAndSendToUserMail(user!.email, text)
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.findByEmail(email);
    if(!user) {
      throwCustomError('Incorrect data!');
    }
    await this.storeOtpAndSendToUserMail(user!.email, 'Use this code to reset your password.')
    return user;
  }

  async resetPassword(email: string, otp: number, password: string) {
    const storedOtp = await this.cacheManager.get(`${email}_otp_code`);
    if(storedOtp !== otp) {
      throwCustomError("Invalid OTP code!")
    } 
    const user = await this.findByEmail(email);
    if(user!.verifiedAt === null) {
      user!.verifiedAt = new Date();
    }
    user!.password = await generatePassword(password)
    return this.userRepository.save(user!);
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

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({where: {email}});
  }

  async storeOtpAndSendToUserMail(email: string, text: string) {
    const code = Math.floor(Math.random() * 900000) + 100000;
    await this.cacheManager.set(`${email}_otp_code`, code, 300000);
    this.mailService.sendMail({
      from: `"Movie Net" <${process.env.APP_USER}>`,
      to: email,
      subject: `Welcome to Movie Net`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>Welcome!</h2>
          <p>We’re glad you joined us.</p>
          <p>Your OTP code is: <strong>${code}</strong></p>
          <p>${text}</p>
          <small>This code will expire 5 minutes after it was sent.</small>
        </div>
      `
    });
  }
}
