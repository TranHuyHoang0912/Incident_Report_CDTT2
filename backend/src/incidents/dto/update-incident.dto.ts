import { IsOptional } from 'class-validator';

export class UpdateIncidentDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  roomId?: number;

  @IsOptional()
  incidentTypeId?: number;

  @IsOptional()
  handledById?: number;
}
