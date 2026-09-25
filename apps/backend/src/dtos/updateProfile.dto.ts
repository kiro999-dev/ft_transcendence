import {
    IsString,
    IsPhoneNumber,
    MinLength,
    Matches,
    MaxLength,
    IsNotEmpty,
} from 'class-validator';
export class UpdateProfileDto {

    @MaxLength(100)
    @IsString()
    @MinLength(2)
    @IsNotEmpty()
    @Matches(/^\S+$/, {
        message: 'First name must not contain spaces',
    })
    firstName?: string;

    @MaxLength(100)
    @IsString()
    @MinLength(2)
    @IsNotEmpty()
    @Matches(/^\S+$/, {
        message: 'Last name must not contain spaces',
    })
    lastName?: string;

    @Matches(/^\+?[1-9]\d{7,14}$/, {
        message: 'Phone number must contain only digits',
    })
    @IsPhoneNumber()
    phone?: string;

}