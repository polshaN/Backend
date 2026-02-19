// src/types/express.d.ts
import { UserDto } from "../services/user.service"; // or wherever your user type is

declare global {
    namespace Express {
        interface Request {
            user?: UserDto & { _id: string; role?: string; photo?: string };
            // Adjust this type to match your userService return object
        }
    }
}
import { Request } from "express";

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
    userRoles?: string[];
}
