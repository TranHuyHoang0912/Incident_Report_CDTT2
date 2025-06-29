import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateStaffRatingDto {
  incidentId: number;
  staffId: number; // người được đánh giá
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
