import { IsUUID, IsDateString, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class VisitDto {
  @IsUUID()
  @IsNotEmpty()
  lead_id: string;

  @IsUUID()
  @IsNotEmpty()
  contact_id: string;

  @IsUUID()
  @IsNotEmpty()
  property_id: string;

  @IsUUID()
  @IsNotEmpty()
  agent_id: string;

  @IsDateString()
  @IsNotEmpty()
  starts_at: string;

  @IsString()
  @IsOptional()
  customer_notes?: string;
}