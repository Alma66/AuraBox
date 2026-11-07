import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
type RequestUser = {
    id: number;
    role: string;
};
export declare class NewsletterService {
    private readonly prisma;
    private readonly mailer;
    constructor(prisma: PrismaService, mailer: MailerService);
    private assertClubAccess;
    private getSentTodayCount;
    findSubscriberEmails(idClub: number): Promise<{
        email: string;
    }[]>;
    send(dto: CreateNewsletterDto, user: RequestUser): Promise<any>;
    findHistoryByClub(idClub: number, user: RequestUser): Promise<any[]>;
}
export {};
