import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { UpdateTransactionHistoryDto } from './dto/update-transaction-history.dto';
type RequestUser = {
    id: number;
    role: string;
};
export declare class TransactionHistoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertClubAccess;
    private resolveClubId;
    private assertTransactionAccess;
    create(dto: CreateTransactionHistoryDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number, user: RequestUser): Promise<any>;
    findByUser(idUser: number, user: RequestUser): Promise<any[]>;
    findBySubscription(idUserSubscriptions: number, user: RequestUser): Promise<any[]>;
    findByClub(idClub: number, user: RequestUser): Promise<any[]>;
    update(id: number, dto: UpdateTransactionHistoryDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
export {};
