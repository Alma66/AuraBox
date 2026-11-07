import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { SetAdminActiveDto } from './dto/set-admin-active.dto';
import { SetAdminPasswordDto } from './dto/set-admin-password.dto';
export declare class AdminsController {
    private readonly svc;
    constructor(svc: AdminsService);
    create(dto: CreateAdminDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByEmail(email: string): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateAdminDto): Promise<any>;
    setActive(id: number, dto: SetAdminActiveDto, req: any): Promise<any>;
    setPassword(id: number, dto: SetAdminPasswordDto): Promise<{
        message: string;
    }>;
}
