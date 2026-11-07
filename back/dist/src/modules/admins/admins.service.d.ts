import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
export declare class AdminsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private emailTaken;
    create(dto: CreateAdminDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByEmail(email: string): Promise<any>;
    update(id: number, dto: UpdateAdminDto): Promise<any>;
    setActive(id: number, active: boolean, requesterId: number): Promise<any>;
    setPassword(id: number, password: string): Promise<{
        message: string;
    }>;
}
