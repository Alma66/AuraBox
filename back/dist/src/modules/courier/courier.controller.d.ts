import { CourierService } from './courier.service';
import { SetClubCouriersDto } from './dto/set-club-couriers.dto';
import { SetCourierFeeDto } from './dto/set-courier-fee.dto';
export declare class CourierController {
    private readonly svc;
    constructor(svc: CourierService);
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
