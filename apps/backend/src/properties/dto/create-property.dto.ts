import { IsString, IsNotEmpty, IsNumber,  IsPositive, IsIn, IsOptional, IsInt, Min} from "class-validator";

export class CreatePropertyDto
{
    @IsString()
    @IsNotEmpty()
    title:string;

    @IsNumber()
    @IsPositive()
    price:number;
    
    @IsString()
    @IsNotEmpty()
    country:string;

    @IsString()
    @IsNotEmpty()
    city:string;

    @IsString()
    @IsIn(['apartment', 'villa', 'house', 'riad', 'land', 'office'])
    property_type:string;

    @IsString()
    @IsIn(['sale', 'rent'])
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