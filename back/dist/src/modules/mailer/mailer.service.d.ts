export declare class MailerService {
    private readonly logger;
    private readonly transporter;
    private readonly from;
    constructor();
    sendVerificationCode(to: string, code: string, expiresAt: Date): Promise<void>;
    sendRaw(to: string, subject: string, html: string): Promise<boolean>;
}
