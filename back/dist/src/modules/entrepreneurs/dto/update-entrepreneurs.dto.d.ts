import { CreateEntrepreneurDto } from './create-entrepreneurs.dto';
declare const UpdateEntrepreneurDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateEntrepreneurDto>>;
export declare class UpdateEntrepreneurDto extends UpdateEntrepreneurDto_base {
    phoneNumber?: number;
}
export {};
