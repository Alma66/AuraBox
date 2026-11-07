import { CourierService } from './courier.service';
import { SetClubCouriersDto } from './dto/set-club-couriers.dto';
import { SetCourierFeeDto } from './dto/set-courier-fee.dto';
export declare class CourierController {
    private readonly svc;
    constructor(svc: CourierService);
    findAll(): Promise<{
        id: number;
        name: string;
        active: boolean;
        code: string;
        isInternal: boolean;
    }[]>;
    findByClub(idClub: number, req: any): Promise<any[]>;
    setClubCouriers(idClub: number, dto: SetClubCouriersDto, req: any): Promise<any[]>;
    setCourierFee(idClub: number, idCourier: number, dto: SetCourierFeeDto, req: any): Promise<any>;
}
