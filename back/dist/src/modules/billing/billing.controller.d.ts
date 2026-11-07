import { BillingService } from './billing.service';
export declare class BillingController {
    private readonly billing;
    constructor(billing: BillingService);
    runRenewals(): Promise<import("./billing.service").BillingRunResult>;
}
