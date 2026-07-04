import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
export declare class AdminsController {
    private readonly svc;
    constructor(svc: AdminsService);
    create(dto: CreateAdminDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByEmail(email: string): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateAdminDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
