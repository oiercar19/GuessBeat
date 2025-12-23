import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import usersProxy from "./routes/usersProxy.js";
import chatProxy from "./routes/chatProxy.js";
import rankingProxy from "./routes/rankingProxy.js";
import gameProxy from "./routes/gameProxy.js";
import categoriesProxy from "./routes/categoriesProxy.js";
import { swaggerUi, swaggerSpec } from "../config/swagger.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(morgan("dev"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "GuessBeat API Docs"
}));

app.use("/api/users", usersProxy);
app.use("/api/chat", chatProxy);
app.use("/api/users/ranking", rankingProxy);
app.use("/api/categories", categoriesProxy);
app.use("/api/game", gameProxy);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "API Gateway funcionando correctamente",
    documentation: "http://localhost:5000/api-docs",
    services: {
      users: process.env.USER_SERVICE_URL || "http://localhost:5001",
      game: process.env.GAME_SERVICE_URL || "http://localhost:8002",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada en el Gateway",
    path: req.path,
  });
});

export default app;
