import { PrismaService } from '../../prisma/prisma.service';
import { CreateLicenseTypeDto } from './dto/create-license-type.dto';
import { UpdateLicenseTypeDto } from './dto/update-license-type.dto';
export declare class LicenseTypesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateLicenseTypeDto): Promise<{
        id: number;
        name: string;
        description: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        description: string | null;
    }[]>;
    findByName(name: string): Promise<{
        id: number;
        name: string;
        description: string | null;
    } | null>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
    }>;
    update(id: number, dto: UpdateLicenseTypeDto): Promise<{
        id: number;
        name: string;
        description: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
