import { PartialType } from '@nestjs/mapped-types';
import { CreateClubStatusHistoryDto } from './create-club-status-history.dto';

export class UpdateClubStatusHistoryDto extends PartialType(CreateClubStatusHistoryDto) {}