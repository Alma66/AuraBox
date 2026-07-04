import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
export declare class PaymentMethodsController {
    private readonly svc;
    constructor(svc: PaymentMethodsService);
    create(dto: CreatePaymentMethodDto): Promise<{
        id: number;
        active: boolean;
        method: string;
    }>;
    findAll(): Promise<{
        id: number;
        active: boolean;
        method: string;
    }[]>;
    findActive(): Promise<{
        id: number;
        active: boolean;
        method: string;
    }[]>;
    findByMethod(method: string): Promise<{
        id: number;
        active: boolean;
        method: string;
    } | null>;
    findOne(id: number): Promise<{
        id: number;
        active: boolean;
        method: string;
    }>;
    update(id: number, dto: UpdatePaymentMethodDto): Promise<{
        id: number;
        active: boolean;
        method: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
