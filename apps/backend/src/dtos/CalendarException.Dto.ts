import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCalendarExceptionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD

  @IsBoolean()
  @IsNotEmpty()
  isUnavailable: boolean; // true = congé/blocked, false = custom hours

  @IsString()
  @IsOptional()
  startTime?: string; // e.g., "10:00" (optional ila isUnavailable = true)

  @IsString()
  @IsOptional()
  endTime?: string; // e.g., "14:00" (optional ila isUnavailable = true)

  @IsString()
  @IsOptional()
  reason?: string; // e.g., "Holiday", "Personal issue"
}