import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "GuessBeat - API Gateway",
            version: "1.0.0",
            description:
                "API Gateway centralizado para todos los microservicios de GuessBeat 🎵",
        },
        servers: [
            {
                url: "http://localhost:5000/api",
                description: "API Gateway - Servidor local",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            {
                name: "User-Service (Express)",
                description: "Microservicio de usuarios, chat y ranking",
                "x-displayName": "User-Service (Express)",
            },
            {
                name: "Usuarios",
                description: "Operaciones relacionadas con los usuarios",
            },
            {
                name: "Chat",
                description: "Operaciones del chat general",
            },
            {
                name: "Ranking",
                description: "Operaciones del ranking de jugadores",
            },
            {
                name: "Game-Service (FastAPI)",
                description: "Microservicio de juego y categorías",
                "x-displayName": "Game-Service (FastAPI)",
            },
            {
                name: "Game",
                description: "Operaciones del servicio de juego",
            },
            {
                name: "Categories",
                description: "Operaciones de categorías de música",
            },
        ],
        "x-tagGroups": [
            {
                name: "User-Service (Express)",
                tags: ["Usuarios", "Chat", "Ranking"],
            },
            {
                name: "Game-Service (FastAPI)",
                tags: ["Game", "Categories"],
            },
        ],
    },
    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
