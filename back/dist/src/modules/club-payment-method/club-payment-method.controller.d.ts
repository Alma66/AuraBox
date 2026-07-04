import { ClubPaymentMethodService } from './club-payment-method.service';
import { CreateClubPaymentMethodDto } from './dto/create-club-payment-method.dto';
import { UpdateClubPaymentMethodDto } from './dto/update-club-payment-method.dto';
export declare class ClubPaymentMethodController {
    private readonly svc;
    constructor(svc: ClubPaymentMethodService);
    create(dto: CreateClubPaymentMethodDto): Promise<{
        id: number;
        idClub: number;
        idPaymentMethod: number;
    }>;
    findAll(): Promise<{
        id: number;
        idClub: number;
        idPaymentMethod: number;
    }[]>;
    findByClub(idClub: number): Promise<{
        id: number;
        idClub: number;
        idPaymentMethod: number;
    }[]>;
    findByPaymentMethod(idPaymentMethod: number): Promise<{
        id: number;
        idClub: number;
        idPaymentMethod: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        idClub: number;
        idPaymentMethod: number;
    }>;
    update(id: number, dto: UpdateClubPaymentMethodDto): Promise<{
        id: number;
        idClub: number;
        idPaymentMethod: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
