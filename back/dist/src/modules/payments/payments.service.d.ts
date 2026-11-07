import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertClubAccess;
    create(dto: CreatePaymentDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOneForUser(id: number, user: {
        id: number;
        role: string;
    }): Promise<any>;
    findByUser(idUser: number): Promise<any[]>;
    findByClub(idClub: number, user: {
        id: number;
        role: string;
    }): Promise<any[]>;
    update(id: number, dto: UpdatePaymentDto): Promise<any>;
    settle(id: number, action: 'confirm' | 'reject', user: {
        id: number;
        role: string;
    }): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
