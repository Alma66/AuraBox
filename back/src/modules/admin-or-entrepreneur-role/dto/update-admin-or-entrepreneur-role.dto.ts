import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminOrEntrepreneurRoleDto } from './create-admin-or-entrepreneur-role.dto';

export class UpdateAdminOrEntrepreneurRoleDto extends PartialType(CreateAdminOrEntrepreneurRoleDto) {}