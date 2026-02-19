import { IsEmail, IsNotEmpty, Length, IsOptional } from "class-validator";
export class UserDto {
    @IsNotEmpty({ message: 'First name is required' })
    @Length(2, 50)
    firstName!: string;

    @IsNotEmpty({ message: 'Last name is required' })
    @Length(2, 50)
    lastName!: string;

    @IsEmail({}, { message: 'Invalid email' })
    email!: string;

    @IsOptional()
    @Length(5, 30)
    phone?: string;

    @IsOptional()
    @Length(2, 32)
    telegramUsername?: string;

    @IsOptional()
    adoptionPoints?: number;

    @IsOptional()
    keycloakId?: string;

    @IsOptional()
    photo?: string;

    @IsOptional()
    role?: string;
}
