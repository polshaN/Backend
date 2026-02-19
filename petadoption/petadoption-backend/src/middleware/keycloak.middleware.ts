// petadoption-backend/src/middleware/keycloak.middleware.ts
import Keycloak from "keycloak-connect";
import session from "express-session";
import { Config } from "../config";

const memoryStore = new session.MemoryStore();

export const sessionMiddleware = session({
    secret: "SuperSecretSessionKey123!",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
});

export const keycloak = new Keycloak({ store: memoryStore }, {
    realm: Config.keycloak.realm,
    "auth-server-url": Config.keycloak.baseUrl,
    "ssl-required": "external",
    resource: Config.keycloak.clientId,
    "public-client": true,
    "confidential-port": 0,
} as any);
