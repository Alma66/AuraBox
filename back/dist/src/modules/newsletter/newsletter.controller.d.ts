import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
export declare class NewsletterController {
    private readonly newsletterService;
    constructor(newsletterService: NewsletterService);
    send(dto: CreateNewsletterDto, req: any): Promise<any>;
    findHistory(idClub: number, req: any): Promise<any[]>;
}
