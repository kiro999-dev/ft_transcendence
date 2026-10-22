// availability.dto.ts
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class GetAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  property_id: string;

  @IsDateString()
  preferred_date: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsNumber()
  @IsOptional()
  duration_minutes?: number; // 👈 Zid hhad l-field hna!
}