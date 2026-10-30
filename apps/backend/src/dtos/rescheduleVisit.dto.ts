import { IsDateString, IsNotEmpty } from 'class-validator';

export class RescheduleVisitDto {
  @IsDateString()
  @IsNotEmpty()
  starts_at: string;
}
