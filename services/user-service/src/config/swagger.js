import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GuessBeat - User Service API",
      version: "1.0.0",
      description:
        "API del microservicio de usuarios para la aplicación GuessBeat 🎵",
      contact: {
        name: "Oier Carbón",
        email: "oier@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5001/api",
        description: "Servidor local",
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
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
