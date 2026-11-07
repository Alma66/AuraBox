import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export interface BillingRunResult {
    renewed: number;
    scheduled: number;
    skipped: number;
}
export declare class BillingService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly logger;
    private timer;
    private firstRun;
    private running;
    constructor(prisma: PrismaService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    run(): Promise<BillingRunResult>;
    processDueRenewals(): Promise<BillingRunResult>;
}
