import { RoleScope } from '@prisma/client';
export declare class CreateRoleDto {
    code: string;
    name: string;
    description: string;
    scope?: RoleScope;
    createdAt?: string;
}
