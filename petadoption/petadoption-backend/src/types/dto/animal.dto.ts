import {IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min} from "class-validator";
import {HealthStatus} from "../../database/models/animal.model";

import {AdoptionStatus} from "../../database/models/adoptionStatus";
import {Type} from "class-transformer";

export class AnimalDto {
    @IsString()
    @IsNotEmpty({ message: "Name is required" })
    name!: string;

    @IsString()
    @IsNotEmpty({ message: "Type is required" })
    type!: string;

    @IsString()
    @IsNotEmpty({ message: "Breed is required" })
    breed!: string;


    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0.1, { message: "Age must be at least 0.1" })
    @Max(60, { message: "Age cannot exceed 60" })
    @Type(() => Number)       // <-- converts string to number
    age!: number;

    @IsNotEmpty({ message: "Adoption status is required" })
    @IsEnum(AdoptionStatus, { message: "Invalid adoption status" })
    adoption_status: AdoptionStatus = AdoptionStatus.available;

    @IsNotEmpty({ message: "Health status is required" })
    @IsEnum(HealthStatus, { message: "Invalid health status" })
    health_status: HealthStatus = HealthStatus.healthy;

    @IsString()
    @IsOptional()
    photo?: string;
}
