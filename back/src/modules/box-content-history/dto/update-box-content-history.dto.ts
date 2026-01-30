import { PartialType } from '@nestjs/mapped-types';
import { CreateBoxContentHistoryDto } from './create-box-content-history.dto';

export class UpdateBoxContentHistoryDto extends PartialType(CreateBoxContentHistoryDto) {}