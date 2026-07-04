import { AssignedToType } from '@prisma/client';
export declare class CreateAdminOrEntrepreneurRoleDto {
    idRole: number;
    assignedToType: AssignedToType;
    assignedTo: number;
    assignedByType: AssignedToType;
    assignedBy: number;
    assignedAt?: string;
}
