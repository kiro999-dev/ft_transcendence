import { IsArray, IsInt, IsNotEmpty, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilityRuleItemDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @IsString()
  @IsNotEmpty()
  startTime: string; // e.g. "09:00"

  @IsString()
  @IsNotEmpty()
  endTime: string; // e.g. "18:00"
}

export class SetWeeklyAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @Min(15)
  @Max(120)
  slotDuration: number; // Default 30 min

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityRuleItemDto)
  rules: AvailabilityRuleItemDto[];
}