import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { SetClubCouriersDto } from './dto/set-club-couriers.dto';
import { SetCourierFeeDto } from './dto/set-courier-fee.dto';
export declare class CourierService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCourierDto): Promise<{
        code: string;
        name: string;
        id: number;
        active: boolean;
        isInternal: boolean;
    }>;
    findAll(): Promise<{
        code: string;
        name: string;
        id: number;
        active: boolean;
        isInternal: boolean;
    }[]>;
    findByClub(idClub: number): Promise<any[]>;
    setClubCouriers(idClub: number, dto: SetClubCouriersDto): Promise<any[]>;
    setCourierFee(idClub: number, idCourier: number, dto: SetCourierFeeDto): Promise<any>;
}
