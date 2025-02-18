import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/requests/create-admin.dto';
import { UpdateAdminDto } from './dto/requests/update-admin.dto';
import { generatePassword, throwCustomError, unlinkImage } from 'src/common/helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { paginate, PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminDto } from './dto/requests/login-admin.dto';
import { promisify } from 'util';
import { scrypt as _scrypt } from 'crypto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async create(createAdminDto: CreateAdminDto, file: Express.Multer.File) {
    const hashPassword = await generatePassword(createAdminDto.password)
    let fileName: string | null = null;
    if(file) {
        fileName = file.filename;
    }
    const adminInstance = this.adminRepository.create({
        name: createAdminDto.name,
        email: createAdminDto.email,
        image: fileName,
        password: hashPassword
    });
    const admin = await this.adminRepository.save(adminInstance);
    return admin;
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Admin>> {
    const config: PaginateConfig<Admin> = {
      sortableColumns: ['id', 'name', 'email'],
      maxLimit: 10,
      defaultSortBy: [['createdAt', 'DESC']]
    }
    query.limit = query.limit == 0 ? 10 : query.limit;
    const result = await paginate<Admin>(query, this.adminRepository, config)
    return result;
  }

  async findOne(id: number) {
    const admin = await this.adminRepository.findOne({where: {id}}); 
    if(!admin) {
        throwCustomError('Admin not found.');
    }
    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto, file: Express.Multer.File) {
    const admin = await this.findOne(id);
    if(updateAdminDto.email) {
        const existedAdmin = await this.adminRepository.findOne({where: {email: updateAdminDto.email, id: Not(id)}});
        if(existedAdmin) {
            throwCustomError('Email has already exist.');
        }
    }
    if(updateAdminDto.password) {
        updateAdminDto.password = await generatePassword(updateAdminDto.password)
    }else {
        updateAdminDto.password = admin!.password
    }
    if(file && admin!.image) {
        await unlinkImage('admins', admin!.image);
    }
    Object.assign(admin!, updateAdminDto);
    if(file) {
        admin!.image = file.filename;
    }
    return this.adminRepository.save(admin!);
  }

  async remove(id: number) {
      const admin = await this.findOne(id);
      if(admin!.image) {
          await unlinkImage('admins', admin!.image);
      }
      await this.adminRepository.remove(admin!);
      return admin;
  }

  async login(loginAdminDto: LoginAdminDto) {
    const [user] = await this.adminRepository.find({ where: { email: loginAdminDto.email } });
    if(!user) {
      throwCustomError('Your credentials is incorrect.', HttpStatus.UNAUTHORIZED);
    }   
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(loginAdminDto.password, salt, 32)) as Buffer;
    if(storedHash !== hash.toString('hex')) {
      throwCustomError('Your password is incorrect!', HttpStatus.UNAUTHORIZED);
    }
    const token = await this.generateToken({ id: user.id, email: user.email });
    return {...user, access_token: token};
  }  

  async generateToken(payload) { //  Error: secretOrPrivateKey must have a value
    return this.jwtService.signAsync(payload);
  }
}
