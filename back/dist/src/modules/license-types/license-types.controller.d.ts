import { LicenseTypesService } from './license-types.service';
import { CreateLicenseTypeDto } from './dto/create-license-type.dto';
import { UpdateLicenseTypeDto } from './dto/update-license-type.dto';
export declare class LicenseTypesController {
    private readonly svc;
    constructor(svc: LicenseTypesService);
    create(dto: CreateLicenseTypeDto): Promise<{
        name: string;
        description: string | null;
        id: number;
    }>;
    findAll(): Promise<{
        name: string;
        description: string | null;
        id: number;
    }[]>;
    findByName(name: string): Promise<{
        name: string;
        description: string | null;
        id: number;
    } | null>;
    findOne(id: number): Promise<{
        name: string;
        description: string | null;
        id: number;
    }>;
    update(id: number, dto: UpdateLicenseTypeDto): Promise<{
        name: string;
        description: string | null;
        id: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
