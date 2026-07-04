import { EntrepreneurLicensesService } from './entrepreneur-licenses.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
export declare class EntrepreneurLicensesController {
    private readonly service;
    constructor(service: EntrepreneurLicensesService);
    create(dto: CreateEntrepreneurLicenseDto, req: any, document?: Express.Multer.File): Promise<any>;
    findAll(): Promise<any[]>;
    findByEntrepreneur(idEntrepreneur: number, req: any): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateEntrepreneurLicenseDto, req: any): Promise<any>;
    verify(id: number, body: {
        verificationStatus: string;
        verificationNotes?: string;
    }): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
