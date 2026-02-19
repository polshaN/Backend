import express, { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";
import { AnimalsController } from "./controllers/animals.controller";
import { UsersController } from "./controllers/users.controller";
import { AdoptionsController } from "./controllers/adoption.controller";
import { ProfileController } from "./controllers/profile.controller";
import { apiErrorHandler } from "../middleware/error.middleware";
import { keycloak, sessionMiddleware } from "../middleware/keycloak.middleware";
import { setupSwagger } from "../swagger/swagger";
import path from "path";
import {uploadPhoto} from "../middleware/upload.middleware";

dotenv.config();

export const server = express();

// ================== MIDDLEWARE ==================
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
console.log('📁 Serving static files from:', uploadsPath);
server.use('/uploads', express.static(uploadsPath));


// Swagger (optional for internal testing)
setupSwagger(server);

// Custom middleware to extract JWT without requiring Keycloak session
server.use((req: any, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
                req.userId = payload.sub;
                req.userEmail = payload.email || payload.preferred_username;

                // Check BOTH realm_access and resource_access roles
                const realmRoles = payload.realm_access?.roles || [];
                const clientRoles = payload.resource_access?.['petadoption-client']?.roles || [];
                req.userRoles = [...realmRoles, ...clientRoles];

                console.log(`[Auth] User: ${req.userEmail}, Roles: ${req.userRoles.join(',')}`);
            }
        } catch (error) {
            console.log('[Auth] Failed to parse token');
        }
    }

    next();
});

// ================== API ROUTER ==================
const apiRouter = express.Router();

// ===== Profile =====
const profileController = new ProfileController();
apiRouter.get("/profile", (req, res) => {
    console.log('[Profile] Request headers:', req.headers.authorization ? 'Bearer token present' : 'No token');
    return profileController.getUserProfile(req, res);
});

// ===== Middleware to check staff/admin role =====
const requireStaffRole = (req: any, res: Response, next: NextFunction) => {
    const userRoles = req.userRoles || [];
    const isStaff = userRoles.includes('staff') || userRoles.includes('admin');
    
    if (!isStaff) {
        return res.status(403).json({
            status: 'error',
            message: 'Staff role required to create/update animals'
        });
    }
    next();
};

// ===== Animals (PUBLIC for GET, STAFF ONLY for POST/PUT/DELETE) =====
const animalsController = new AnimalsController();
apiRouter.get("/animals", animalsController.getAll.bind(animalsController));
apiRouter.get("/animals/:id", animalsController.getById.bind(animalsController));
apiRouter.post("/animals", requireStaffRole, uploadPhoto.single('photo'), animalsController.create.bind(animalsController));
apiRouter.put("/animals/:id", requireStaffRole, uploadPhoto.single('photo'), animalsController.update.bind(animalsController));
apiRouter.delete("/animals/:id", requireStaffRole, animalsController.delete.bind(animalsController));

// ===== Adoptions (REQUIRES AUTH) =====
const adoptionsController = new AdoptionsController();

// Add auth check middleware for adoption routes
const requireAuth = (req: any, res: Response, next: NextFunction) => {
    if (!req.userEmail) {
        console.log('[Adoptions] No user email found in request');
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required - no user email in token'
        });
    }
    next();
};

apiRouter.post("/adoptions", requireAuth, (req, res) => {
    console.log(`[Adoptions] Creating adoption for user: ${(req as any).userEmail}`);
    return adoptionsController.request(req, res);
});

apiRouter.get("/adoptions", requireAuth, adoptionsController.getUserAdoptions.bind(adoptionsController));
apiRouter.get("/adoptions/admin", requireAuth, adoptionsController.getAllAdoptions.bind(adoptionsController));
apiRouter.put("/adoptions/:id/approve", requireAuth, adoptionsController.approve.bind(adoptionsController));
apiRouter.put("/adoptions/:id/reject", requireAuth, adoptionsController.reject.bind(adoptionsController));
apiRouter.put("/adoptions/:id/schedule", requireAuth, adoptionsController.schedule.bind(adoptionsController));
apiRouter.put("/adoptions/:id/cancel", requireAuth, adoptionsController.cancel.bind(adoptionsController));
apiRouter.delete("/adoptions/:id", requireAuth, adoptionsController.deleteAdoption.bind(adoptionsController));

// ===== Users =====
const usersController = new UsersController();
apiRouter.get("/users", usersController.getAll.bind(usersController));
apiRouter.get("/users/search", usersController.searchByName.bind(usersController));
apiRouter.post("/users", usersController.create.bind(usersController));
apiRouter.get("/users/:id", usersController.getById.bind(usersController));
apiRouter.put("/users/:id", usersController.update.bind(usersController));
apiRouter.delete("/users/:id", usersController.delete.bind(usersController));
apiRouter.post("/users/keycloak", usersController.getOrCreateByKeycloak.bind(usersController));

// Mount router
server.use("/api", apiRouter);

// ===== Global error handler =====
server.use(apiErrorHandler);

// ================== START SERVER ==================
const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
    console.log(`PetAdoption backend running on port ${PORT}`);
});