import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Pet Adoption API",
            version: "1.0.0",
            description: "API for managing animals in a pet adoption system",
        },
        servers: [
            { url: "http://localhost:4001" }
        ],
    },
    apis: ["./src/api/controllers/*.ts"], // <-- Path to your controllers with swagger comments
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
