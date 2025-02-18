import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import { Request } from 'express';
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AdminService } from "src/admin/admin.service";
import { throwValidationError } from "../helper";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private adminService: AdminService,
        private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throwValidationError('Unauthenticated', HttpStatus.UNAUTHORIZED);
        }

        try {
            const payload = await this.jwtService.verifyAsync(token!, {secret: this.configService.get('JWT_SECRET')});
            const user = await this.adminService.findOne(+payload.id);
            if (!user) {
                throwValidationError('Unauthenticated', HttpStatus.UNAUTHORIZED);
            }
            request['user'] = user;
        } catch (error) {
            throwValidationError('Unauthenticated', HttpStatus.UNAUTHORIZED);
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}