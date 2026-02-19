// src/models/user.ts
import { ObjectId } from "mongodb";

import {AdoptionStatus} from "./adoptionStatus";
export default class UserModel {
    constructor(
        public _id: ObjectId,
        public firstName: string,
        public lastName: string,
        public email: string,
        public phone?: string,
        public telegramUsername?: string,
        public avatar?: string,
        public role: "user" | "staff" | "admin" = "user",
        public adoptionPoints: number = 0
    ) {}
}
