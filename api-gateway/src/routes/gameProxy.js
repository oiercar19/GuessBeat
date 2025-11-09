import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.GAME_SERVICE_URL || "http://localhost:8002",
    changeOrigin: true,
    // ✅ No reescribas el path (mantén /game en el microservicio)
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🎮 Proxy -> ${req.method} ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
      console.error("❌ Error en el proxy de GAME:", err);
      res
        .status(500)
        .json({ message: "Error en el proxy del microservicio de juego" });
    },
  })
);

export default router;
