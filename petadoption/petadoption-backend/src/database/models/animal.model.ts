import { ObjectId } from "mongodb";

import {AdoptionStatus} from "./adoptionStatus";

export enum HealthStatus {
    healthy = "healthy",
    sick = "sick",
    vaccinated = "vaccinated",
    unknown = "unknown",
}



export default class AnimalModel {
    constructor(
        public _id: ObjectId,
        public name: string,
        public type: string,
        public breed: string,
        public age: number,
        public health_status: HealthStatus.healthy,
        public adoption_status: AdoptionStatus.available,
        // public is_adopted: boolean,
        // public shelter_id: ObjectId,
        public description?: string,
        public photo?: string
    ) {}
}
