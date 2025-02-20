import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { throwCustomError } from "../helper";
import { UsersAdminService } from "src/users/admin/users-admin.service";

@Injectable()
export class UserGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private userService: UsersAdminService,
        private configService: ConfigService,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if(!token) {
            throwCustomError('Unauthenticated', HttpStatus.UNAUTHORIZED);
        }
        
        try {
            const payload = await this.jwtService.verifyAsync(token!, {secret: this.configService.get('JWT_SECRET')});// error occur
            const user = await this.userService.findOne(+payload.id);
            if (!user) {
                throwCustomError('Unauthenticated', HttpStatus.UNAUTHORIZED);
            }
            request['user'] = user;
        } catch (error) {
            throwCustomError('Unauthenticated', HttpStatus.UNAUTHORIZED);
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}