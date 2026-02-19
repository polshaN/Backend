import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email?: string;
        username?: string;
    };
}

export function attachUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Token missing',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded: any = jwt.decode(token);

        if (!decoded || !decoded.sub) {
            return res.status(401).json({
                status: 'error',
                message: 'User ID not found in token',
            });
        }

        req.user = {
            id: decoded.sub, // 🔑 Keycloak user id
            email: decoded.email,
            username: decoded.preferred_username,
        };

        next();
    } catch (err) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token',
        });
    }
}
