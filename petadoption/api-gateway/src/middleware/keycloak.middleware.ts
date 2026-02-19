// api-gateway/src/middleware/keycloak.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface GatewayUser {
    id: string;
    email?: string;
    username?: string;
    roles?: string[];
}

export function keycloakMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Authorization token missing',
        });
    }

    const token = authHeader.split(' ')[1];

    const decoded: any = jwt.decode(token);

    if (!decoded || !decoded.sub) {
        return res.status(401).json({
            status: 'error',
            message: 'User ID not found in token',
        });
    }

    (req as any).user = {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.preferred_username,
        roles: decoded.realm_access?.roles ?? [],
    } as GatewayUser;

    next();
}
