// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from "express";

export function requireRole(role: "user" | "staff" | "admin") {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role; // req.user should already come from Keycloak middleware
        if (!userRole || (userRole !== role && userRole !== "admin")) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
}
