// src/types/dto/adoption.dto.ts
import { IsString, IsOptional, IsEnum } from "class-validator";

import {AdoptionStatus} from "../../database/models/adoptionStatus";

export class AdoptionRequestDto {
    @IsString()
    animalId!: string; // required for requesting adoption
}

export class AdoptionAdminDto {
    @IsString()
    adoptionId!: string; // used for approve/reject actions

    @IsOptional()
    @IsEnum(AdoptionStatus)
    status?: AdoptionStatus; // optional, mainly for Swagger if you want to show enum
}
