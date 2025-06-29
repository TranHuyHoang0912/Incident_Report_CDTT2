import { IsEnum } from 'class-validator';
import { IncidentStatus as PrismaIncidentStatus } from '@prisma/client';
export class UpdateIncidentStatusDto {
  @IsEnum(PrismaIncidentStatus)
  status: PrismaIncidentStatus;
}
