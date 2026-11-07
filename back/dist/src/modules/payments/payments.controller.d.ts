import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { SettlePaymentDto } from './dto/settle-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(dto: CreatePaymentDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByUser(idUser: number, req: any): Promise<any[]>;
    findByClub(idClub: number, req: any): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    settle(id: number, dto: SettlePaymentDto, req: any): Promise<any>;
    update(id: number, dto: UpdatePaymentDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
