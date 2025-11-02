import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import soundcloudAuthRoutes from "./routes/soundcloudAuth.js";  

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 🔍 Middleware de logging ANTES de las rutas
app.use((req, res, next) => {
  console.log(`\n👤 [USER SERVICE] ${req.method} ${req.url}`);
  console.log(`   Headers:`, req.headers);
  console.log(`   Body:`, req.body);
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/auth/soundcloud", soundcloudAuthRoutes);

// 🔍 Ruta de health check
app.get("/", (req, res) => {
  res.json({ message: "✅ User Service funcionando", port: process.env.PORT });
});

// 🔍 Manejador de rutas no encontradas
app.use((req, res) => {
  console.log(`❌ [USER SERVICE] Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Ruta no encontrada en User Service" });
});


export default app;