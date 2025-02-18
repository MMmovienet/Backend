import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { join } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

const scrypt = promisify(_scrypt);

export const throwValidationError = (message: string, httpStatus: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY) => {
    throw new HttpException(
        { message: [message], error: 'Validation Error' },
        httpStatus,
    );
}

export const generatePassword = async (plainPassword: string) => {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(plainPassword, salt, 32)) as Buffer;
    const hashPassword = salt + "." + hash.toString('hex');
    return hashPassword;
}

export const unlinkImage = async (path: string, imageName: string) => {
    await fs.unlink(join(__dirname, '..', '..', '..', 'uploads', path, imageName))
}