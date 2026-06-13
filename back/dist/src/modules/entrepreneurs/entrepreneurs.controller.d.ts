import { EntrepreneursService } from './entrepreneurs.service';
import { CreateEntrepreneurDto } from './dto/create-entrepreneurs.dto';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneurs.dto';
export declare class EntrepreneursController {
    private readonly entrepreneursService;
    constructor(entrepreneursService: EntrepreneursService);
    create(dto: CreateEntrepreneurDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateEntrepreneurDto, req: any): Promise<any>;
    deactivate(id: number): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
