import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import usersProxy from "./routes/usersProxy.js";

dotenv.config();

const app = express();

// 1. CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Logging
app.use(morgan("dev"));

// 3. PROXY - ANTES de body parser
// Importante: el proxy debe ir antes de express.json()
app.use("/api/users", usersProxy);

// 4. Body parser - DESPUÉS del proxy
// Solo afecta a rutas que no son proxy
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "🚪 API Gateway funcionando correctamente",
    services: {
      users: process.env.USER_SERVICE_URL || "http://localhost:5001"
    }
  });
});

// 6. Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    message: "Ruta no encontrada en el Gateway",
    path: req.path 
  });
});

// 7. Manejo de errores global
app.use((err, req, res, next) => {
  console.error("❌ [Gateway] Error:", err.message);
  res.status(500).json({ 
    message: "Error interno del Gateway",
    error: err.message 
  });
});

export default app;