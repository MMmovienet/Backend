import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { join } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

const scrypt = promisify(_scrypt);

export const throwCustomError = (message: string, httpStatus: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY) => {
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

export const unlinkImage = async (path: string, mediaName: string) => {
    const filePath = join(__dirname, '..', '..', '..', 'uploads', path, mediaName);
    console.log('Deleting file:', filePath);
    try {
        await fs.unlink(filePath);
        console.log('File deleted successfully:', filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}