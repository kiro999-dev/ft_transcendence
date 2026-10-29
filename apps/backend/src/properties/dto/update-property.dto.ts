import { IsString, IsNotEmpty, IsNumber,  IsPositive, IsIn, IsOptional, IsInt, Min} from "class-validator";

export class UpdatePropertyDto
{
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    title?:string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price:number;
    
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    country:string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    city:string;

    @IsString()
    @IsIn(['apartment', 'villa', 'house', 'riad', 'land', 'office'])
    @IsOptional()
    property_type:string;

    @IsString()
    @IsIn(['sale', 'rent'])
    @IsOptional()
    listing_type:string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    bedrooms?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    bathrooms?: number;

    @IsOptional()
    @IsPositive()
    @IsNumber()
    area?: number;
}