import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService);
    validateUser(email: string, pass: string): Promise<any>;
    private getUserRole;
    loginWithCredentials(email: string, password: string): Promise<{
        access_token: string;
    }>;
    login(user: any): Promise<{
        access_token: string;
    }>;
}
