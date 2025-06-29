import { IsOptional, IsArray, ArrayMaxSize, IsString } from 'class-validator';

export class CreateIncidentDto {
  title: string;
  description: string;
  roomId: number;
  incidentTypeId: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  imageUrls?: string[];
}
