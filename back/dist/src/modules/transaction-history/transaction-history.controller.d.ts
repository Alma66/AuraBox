import { TransactionHistoryService } from './transaction-history.service';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { UpdateTransactionHistoryDto } from './dto/update-transaction-history.dto';
export declare class TransactionHistoryController {
    private readonly svc;
    constructor(svc: TransactionHistoryService);
    create(dto: CreateTransactionHistoryDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByUser(idUser: number, req: any): Promise<any[]>;
    findBySubscription(idUserSubscriptions: number, req: any): Promise<any[]>;
    findByClub(idClub: number, req: any): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateTransactionHistoryDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
