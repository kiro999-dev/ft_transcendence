import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class GetAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  property_id: string;

  @IsDateString()
  preferred_date: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(120)
  duration_minutes?: number;
}
