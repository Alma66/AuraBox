import { PrismaService } from '../../prisma/prisma.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
export declare class RolePermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateRolePermissionDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByRole(idRole: number): Promise<any[]>;
    findByPermission(idPermissions: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateRolePermissionDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
