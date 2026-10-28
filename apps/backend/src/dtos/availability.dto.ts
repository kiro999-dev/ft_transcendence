import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class GetAvailabilityDto {
    @IsNotEmpty()
    @IsUUID()
    property_id: string;

    @IsNotEmpty()
    @IsString()
    preferred_date: string;

    @IsOptional()
    @IsString()
    timezone?: string;
}
