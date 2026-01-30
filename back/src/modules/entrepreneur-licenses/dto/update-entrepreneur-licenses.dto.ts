import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrepreneurLicenseDto } from './create-entrepreneur-licenses.dto';

export class UpdateEntrepreneurLicenseDto extends PartialType(CreateEntrepreneurLicenseDto) {}