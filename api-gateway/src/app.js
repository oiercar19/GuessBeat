import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import usersProxy from "./routes/usersProxy.js";
import chatProxy from "./routes/chatProxy.js";
import rankingProxy from "./routes/rankingProxy.js";
import gameProxy from "./routes/gameProxy.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(morgan("dev"));

app.use("/api/users", usersProxy);
app.use("/api/chat", chatProxy);
app.use("/api/users/ranking", rankingProxy);
app.use("/api/game", gameProxy);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "🚪 API Gateway funcionando correctamente",
    services: {
      users: process.env.USER_SERVICE_URL || "http://localhost:5001",
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
