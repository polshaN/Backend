// src/models/adoption.model.ts
import {ObjectId} from "mongodb";
import {AdoptionStatus} from "./adoptionStatus";

export default class Adoption{
  constructor(
      public _id: ObjectId,
      public userId: ObjectId,
      public animalId: ObjectId,
      public status: AdoptionStatus,
      public requestTime: Date,
      public approvalTime?: Date,
      public rejectionTime?: Date,
      public cancelledTime?: Date,
      public scheduledTime?: Date,
      public notes?: string
) {}
}
