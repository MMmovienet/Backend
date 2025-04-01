import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import { Request } from 'express';
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { throwCustomError } from "../helper";
import { AdminsService } from "src/admins/admins.service";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private adminsService: AdminsService,
        private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throwCustomError('Unauthenticated', HttpStatus.UNAUTHORIZED);
        }

        try {
            const payload = await this.jwtService.verifyAsync(token!, {secret: this.configService.get('JWT_SECRET')});
            const user = await this.adminsService.findOne(payload.id);
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