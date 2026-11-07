import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { SetClubCouriersDto } from './dto/set-club-couriers.dto';
import { SetCourierFeeDto } from './dto/set-courier-fee.dto';
type RequestUser = {
    id: number;
    role: string;
};
export declare class CourierService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    assertClubAccess(idClub: number, user: RequestUser): Promise<void>;
    create(dto: CreateCourierDto): Promise<{
        id: number;
        name: string;
        active: boolean;
        code: string;
        isInternal: boolean;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        active: boolean;
        code: string;
        isInternal: boolean;
    }[]>;
    findByClub(idClub: number): Promise<any[]>;
    setClubCouriers(idClub: number, dto: SetClubCouriersDto): Promise<any[]>;
    setCourierFee(idClub: number, idCourier: number, dto: SetCourierFeeDto): Promise<any>;
}
export {};
