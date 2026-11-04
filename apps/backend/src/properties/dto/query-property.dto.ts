import { IsOptional, IsString, IsIn, IsNumber, Min, IsInt } from "class-validator";
import { Type } from "class-transformer";
import { PaginationDto } from "../../dtos/Pagination.dto";

export class QueryPropertyDto extends PaginationDto {
    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsIn(['sale', 'rent'])
    listing_type?: string;

    @IsOptional()
    @IsIn(['apartment','villa','house','riad','land','office'])
    property_type?: string;

    @IsOptional()
    @IsIn(['available','reserved','sold','rented','hidden'])
    status?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    bedrooms?: number;
}