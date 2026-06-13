import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RoleController {
    private readonly svc;
    constructor(svc: RoleService);
    create(dto: CreateRoleDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByCode(code: string): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateRoleDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
