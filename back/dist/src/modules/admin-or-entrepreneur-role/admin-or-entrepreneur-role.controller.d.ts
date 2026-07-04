import { AdminOrEntrepreneurRoleService } from './admin-or-entrepreneur-role.service';
import { CreateAdminOrEntrepreneurRoleDto } from './dto/create-admin-or-entrepreneur-role.dto';
import { UpdateAdminOrEntrepreneurRoleDto } from './dto/update-admin-or-entrepreneur-role.dto';
export declare class AdminOrEntrepreneurRoleController {
    private readonly svc;
    constructor(svc: AdminOrEntrepreneurRoleService);
    create(dto: CreateAdminOrEntrepreneurRoleDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByAssignedTo(assignedTo: number): Promise<any[]>;
    findByRole(idRole: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateAdminOrEntrepreneurRoleDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
