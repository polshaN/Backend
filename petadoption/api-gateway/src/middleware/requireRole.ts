// // api-gateway/src/middleware/requireRole.ts
// import { Response, NextFunction } from 'express';
// import { RequestWithUser } from './attachUser';
//
// export function requireRole(role: 'user' | 'staff' | 'admin') {
//     return (req: RequestWithUser, res: Response, next: NextFunction) => {
//         const userRole = req.user?.role || req.user?.roles?.[0]; // fallback to Keycloak roles
//         if (!userRole || (userRole !== role && userRole !== 'admin')) {
//             return res.status(403).json({ message: 'Forbidden' });
//         }
//         next();
//     };
// }
