import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePermissionDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByCode(code: string): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdatePermissionDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
