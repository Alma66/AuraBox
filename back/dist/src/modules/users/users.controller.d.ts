import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(dto: CreateUserDto): Promise<any>;
    getMe(req: any): Promise<any>;
    verifyPassword(req: any, body: {
        password: string;
    }): Promise<{
        ok: boolean;
    }>;
    updateMe(req: any, dto: UpdateUserDto): Promise<any>;
    getNewsletterSubscribers(idClub: number): Promise<any[]>;
    findAll(): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateUserDto, req: any): Promise<any>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
}
