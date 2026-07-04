import { CreateSupplyOrderDto } from './create-supply-order.dto';
declare const UpdateSupplyOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateSupplyOrderDto>>;
export declare class UpdateSupplyOrderDto extends UpdateSupplyOrderDto_base {
    receivedDate?: string;
}
export {};
