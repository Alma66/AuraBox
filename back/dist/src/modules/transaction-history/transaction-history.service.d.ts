import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { UpdateTransactionHistoryDto } from './dto/update-transaction-history.dto';
export declare class TransactionHistoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTransactionHistoryDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByUser(idUser: number): Promise<any[]>;
    findBySubscription(idUserSubscriptions: number): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    update(id: number, dto: UpdateTransactionHistoryDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
