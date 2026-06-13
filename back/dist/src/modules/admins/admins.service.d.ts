import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
export declare class AdminsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private SALT_ROUNDS;
    create(dto: CreateAdminDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByEmail(email: string): Promise<any>;
    update(id: number, dto: UpdateAdminDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
