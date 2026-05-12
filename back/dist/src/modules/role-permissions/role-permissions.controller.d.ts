import { RolePermissionsService } from './role-permissions.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
export declare class RolePermissionsController {
    private readonly svc;
    constructor(svc: RolePermissionsService);
    create(dto: CreateRolePermissionDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByRole(idRole: number): Promise<any[]>;
    findByPermission(idPermission: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateRolePermissionDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
